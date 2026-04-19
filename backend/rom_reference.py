"""
ROM Reference Engine — RecoveryIQ

Provides reference joint angle ranges from:
  1. Embedded clinical norms (always available — from physiotherapy literature)
  2. REHAB24-6 skeleton data (when downloaded — actual exercise recordings)
  3. AddBiomechanics data (when downloaded — 70h motion capture)

Usage:
  from rom_reference import ROMReference
  ref = ROMReference()
  score, flags = ref.score_angles({"left_knee": 118, "right_knee": 125, ...})

CLI:
  python rom_reference.py --build-index   (after running download_datasets.py)
  python rom_reference.py --test          (run a self-test with sample angles)
"""

import json
import os
import argparse
import numpy as np
from pathlib import Path
from typing import Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
INDEX_PATH = os.path.join(DATA_DIR, "rom_index.json")

# ── Clinical reference ranges ─────────────────────────────────────────────────
# Source: AAOS Normal Joint ROM values + physiotherapy literature.
# Angles measured as the interior angle at the joint (MediaPipe convention).
# Standing/resting posture angles (not end-range).
#
# Format: joint → {mean, std, min_acceptable, max_acceptable, clinical_name}
CLINICAL_NORMS = {
    # Shoulder — elbow-shoulder-hip angle in standing
    "left_shoulder":  {"mean": 162, "std": 12, "min": 130, "max": 180, "name": "Left shoulder"},
    "right_shoulder": {"mean": 162, "std": 12, "min": 130, "max": 180, "name": "Right shoulder"},
    # Hip — shoulder-hip-knee angle in standing
    "left_hip":       {"mean": 168, "std": 10, "min": 140, "max": 180, "name": "Left hip"},
    "right_hip":      {"mean": 168, "std": 10, "min": 140, "max": 180, "name": "Right hip"},
    # Knee — hip-knee-ankle angle in standing
    "left_knee":      {"mean": 172, "std": 8,  "min": 155, "max": 185, "name": "Left knee"},
    "right_knee":     {"mean": 172, "std": 8,  "min": 155, "max": 185, "name": "Right knee"},
    # Wrist
    "left_wrist":     {"mean": 165, "std": 15, "min": 130, "max": 185, "name": "Left wrist"},
    "right_wrist":    {"mean": 165, "std": 15, "min": 130, "max": 185, "name": "Right wrist"},
}

# Asymmetry thresholds — how much left vs. right can differ before flagging
ASYMMETRY_THRESHOLD = {
    "shoulder": 12,  # degrees
    "hip":      10,
    "knee":     10,
    "wrist":    20,
}

# Movement quality bands (0-100 score)
QUALITY_BANDS = {
    (85, 100): ("Excellent", "emerald"),
    (70, 84):  ("Good",      "green"),
    (50, 69):  ("Moderate",  "amber"),
    (0,  49):  ("Limited",   "rose"),
}


class ROMReference:
    """
    Computes movement quality scores by comparing patient joint angles
    against reference data. Falls back to clinical norms when datasets
    haven't been downloaded.
    """

    def __init__(self):
        self.norms = dict(CLINICAL_NORMS)
        self.source = "clinical_norms"
        self._try_load_index()

    def _try_load_index(self):
        """Load pre-built index from downloaded datasets if available."""
        if os.path.exists(INDEX_PATH):
            try:
                with open(INDEX_PATH) as f:
                    index = json.load(f)
                # Merge dataset-derived norms (override clinical defaults)
                for joint, data in index.get("norms", {}).items():
                    if joint in self.norms:
                        self.norms[joint].update(data)
                self.source = index.get("source", "dataset")
                print(f"[ROMReference] Loaded {self.source} index ({index.get('n_samples', '?')} samples)")
            except Exception as e:
                print(f"[ROMReference] Index load failed, using clinical norms: {e}")

    # ── Scoring ───────────────────────────────────────────────────────────────

    def score_angles(self, angles: dict) -> tuple[int, list[dict]]:
        """
        Compare measured angles against reference ranges.

        Returns:
            score: 0-100 overall movement quality score
            findings: list of {joint, angle, expected, z_score, flag, severity}
        """
        findings = []
        z_scores = []

        for joint, norm in self.norms.items():
            if joint not in angles:
                continue
            measured = angles[joint]
            mean = norm["mean"]
            std = norm["std"]
            z = (measured - mean) / std if std > 0 else 0
            z_scores.append(abs(z))

            severity = None
            flag = None
            if measured < norm["min"]:
                diff = norm["min"] - measured
                severity = "significant" if diff > 20 else "mild"
                flag = f"{norm['name']} restricted ({measured:.0f}° vs {mean:.0f}° norm)"
            elif measured > norm["max"]:
                diff = measured - norm["max"]
                severity = "significant" if diff > 20 else "mild"
                flag = f"{norm['name']} hypermobile ({measured:.0f}° vs {norm['max']:.0f}° upper bound)"

            findings.append({
                "joint": joint,
                "angle": round(measured, 1),
                "expected": mean,
                "range": [norm["min"], norm["max"]],
                "z_score": round(z, 2),
                "flag": flag,
                "severity": severity,
            })

        # Check L/R asymmetry
        pairs = [
            ("left_shoulder", "right_shoulder", "shoulder"),
            ("left_hip",      "right_hip",      "hip"),
            ("left_knee",     "right_knee",      "knee"),
            ("left_wrist",    "right_wrist",     "wrist"),
        ]
        asymmetry_flags = []
        for l_joint, r_joint, group in pairs:
            if l_joint in angles and r_joint in angles:
                diff = abs(angles[l_joint] - angles[r_joint])
                thresh = ASYMMETRY_THRESHOLD[group]
                if diff > thresh:
                    worse = l_joint if angles[l_joint] < angles[r_joint] else r_joint
                    side = "Left" if "left" in worse else "Right"
                    asymmetry_flags.append({
                        "joint": group,
                        "left": round(angles[l_joint], 1),
                        "right": round(angles[r_joint], 1),
                        "diff": round(diff, 1),
                        "flag": f"{side} {group} asymmetry — {diff:.0f}° difference",
                        "severity": "significant" if diff > thresh * 1.5 else "mild",
                    })

        # Overall quality score: penalise for each z-score deviation
        if z_scores:
            mean_z = np.mean(z_scores)
            max_z = max(z_scores)
            # Normalise: z=0 → 100, z=2 → 60, z=3 → 30
            score = max(0, min(100, int(100 - mean_z * 15 - max_z * 5)))
        else:
            score = 75  # No angles → neutral

        return score, findings, asymmetry_flags

    def quality_label(self, score: int) -> tuple[str, str]:
        for (lo, hi), (label, color) in QUALITY_BANDS.items():
            if lo <= score <= hi:
                return label, color
        return "Unknown", "slate"

    def generate_rom_report(self, angles: dict, patient_name: str = "") -> dict:
        """
        Full ROM analysis report ready for the frontend.
        """
        score, findings, asymmetry = self.score_angles(angles)
        label, color = self.quality_label(score)

        flags = [f["flag"] for f in findings if f["flag"]]
        asym_flags = [a["flag"] for a in asymmetry]

        restricted = [f for f in findings if f["severity"] == "significant"]
        mild = [f for f in findings if f["severity"] == "mild"]

        summary_parts = []
        if restricted:
            joints = ", ".join(f["joint"].replace("_", " ") for f in restricted)
            summary_parts.append(f"significant restriction in {joints}")
        if asymmetry:
            summary_parts.append(f"{len(asymmetry)} asymmetry pattern(s) noted")
        if not summary_parts:
            summary_parts.append("movement quality within expected range")

        name = patient_name or "The client"
        summary = f"{name} shows {'; '.join(summary_parts)}. Movement quality score: {score}/100 ({label})."

        return {
            "score": score,
            "label": label,
            "color": color,
            "summary": summary,
            "findings": findings,
            "asymmetry_flags": asymmetry,
            "all_flags": flags + asym_flags,
            "restricted_joints": [f["joint"] for f in restricted],
            "mild_joints": [f["joint"] for f in mild],
            "reference_source": self.source,
            "angles_analyzed": len(findings),
        }


# ── Index builder (runs after dataset download) ───────────────────────────────

def build_index_from_rehab24():
    """
    Process REHAB24-6 skeleton JSON files to derive reference angle distributions.
    Writes to data/rom_index.json which ROMReference auto-loads.
    """
    rehab_dir = os.path.join(DATA_DIR, "rehab24")
    manifest_path = os.path.join(rehab_dir, "manifest.json")

    if not os.path.exists(manifest_path):
        print("REHAB24-6 not downloaded. Run: python download_datasets.py rehab24")
        return False

    print("Building ROM index from REHAB24-6…")

    skeleton_dir = os.path.join(rehab_dir, "skeleton_3d")
    if not os.path.exists(skeleton_dir):
        skeleton_dir = os.path.join(rehab_dir, "skeleton_2d")
    if not os.path.exists(skeleton_dir):
        print("No skeleton data found. Download skeleton files first.")
        return False

    # REHAB24 joint indices (COCO-26 format)
    # MediaPipe angle triplets → REHAB24 joint indices
    ANGLE_MAP = {
        "left_shoulder":  (6,  5,  12),   # left_elbow, left_shoulder, left_hip
        "right_shoulder": (3,  2,  9),    # right_elbow, right_shoulder, right_hip
        "left_hip":       (5,  12, 13),   # left_shoulder, left_hip, left_knee
        "right_hip":      (2,  9,  10),   # right_shoulder, right_hip, right_knee
        "left_knee":      (12, 13, 14),   # left_hip, left_knee, left_ankle
        "right_knee":     (9,  10, 11),   # right_hip, right_knee, right_ankle
    }

    accumulators = {joint: [] for joint in ANGLE_MAP}
    n_files = 0

    for json_file in Path(skeleton_dir).rglob("*.json"):
        try:
            with open(json_file) as f:
                data = json.load(f)

            # REHAB24 format: list of frames, each frame has "keypoints" array
            frames = data if isinstance(data, list) else data.get("frames", [])
            for frame in frames:
                keypoints = frame.get("keypoints", frame) if isinstance(frame, dict) else frame
                if not keypoints or len(keypoints) < 15:
                    continue

                kp = np.array(keypoints)  # shape: (26, 2 or 3)

                for joint, (a_idx, b_idx, c_idx) in ANGLE_MAP.items():
                    if kp.shape[0] <= max(a_idx, b_idx, c_idx):
                        continue
                    a, b, c = kp[a_idx, :2], kp[b_idx, :2], kp[c_idx, :2]
                    ba = a - b
                    bc = c - b
                    norm_ba = np.linalg.norm(ba)
                    norm_bc = np.linalg.norm(bc)
                    if norm_ba < 1e-6 or norm_bc < 1e-6:
                        continue
                    cos_a = np.dot(ba, bc) / (norm_ba * norm_bc)
                    angle = float(np.degrees(np.arccos(np.clip(cos_a, -1, 1))))
                    accumulators[joint].append(angle)

            n_files += 1
        except Exception:
            continue

    if n_files == 0:
        print("No skeleton JSON files found in expected format.")
        return False

    print(f"  Processed {n_files} skeleton files")

    # Build norms
    norms = {}
    for joint, values in accumulators.items():
        if len(values) < 10:
            continue
        arr = np.array(values)
        p5, p95 = np.percentile(arr, 5), np.percentile(arr, 95)
        norms[joint] = {
            "mean":         float(np.mean(arr)),
            "std":          float(np.std(arr)),
            "min":          float(p5),
            "max":          float(p95),
            "n":            len(arr),
            "name":         CLINICAL_NORMS.get(joint, {}).get("name", joint),
        }
        print(f"  {joint}: {norms[joint]['mean']:.1f}° ± {norms[joint]['std']:.1f}° "
              f"({norms[joint]['min']:.0f}°–{norms[joint]['max']:.0f}°, n={len(arr)})")

    index = {
        "source": "REHAB24-6",
        "n_samples": n_files,
        "norms": norms,
    }
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(INDEX_PATH, "w") as f:
        json.dump(index, f, indent=2)

    print(f"\n✓ ROM index written to {INDEX_PATH}")
    return True


def build_index_from_addbiomechanics():
    """
    Process AddBiomechanics kinematics files to augment ROM index.
    Expects data/addbiomechanics/<subject>/<trial>/kinematics.mot files.
    """
    ab_dir = os.path.join(DATA_DIR, "addbiomechanics")
    if not os.path.exists(ab_dir):
        print("AddBiomechanics not downloaded.")
        return False

    print("Building ROM index supplement from AddBiomechanics…")

    # .mot files contain time-series joint angle data (OpenSim format)
    # Columns include: hip_flexion_r, knee_angle_r, hip_flexion_l, knee_angle_l, etc.
    accumulators = {"right_hip": [], "left_hip": [], "right_knee": [], "left_knee": []}
    n_files = 0

    for mot_file in Path(ab_dir).rglob("*.mot"):
        try:
            with open(mot_file) as f:
                lines = f.readlines()

            # Skip header lines until we find the data table
            header_idx = next((i for i, l in enumerate(lines) if l.strip().startswith("time")), None)
            if header_idx is None:
                continue

            headers = lines[header_idx].strip().split("\t")
            col_map = {h: i for i, h in enumerate(headers)}

            for line in lines[header_idx + 1:]:
                vals = line.strip().split("\t")
                if len(vals) < 2:
                    continue
                try:
                    # OpenSim convention: hip_flexion = angle from vertical
                    # Convert to interior angle (180 - flexion = interior)
                    if "hip_flexion_r" in col_map:
                        hip_r = 180 - abs(float(vals[col_map["hip_flexion_r"]]))
                        accumulators["right_hip"].append(hip_r)
                    if "hip_flexion_l" in col_map:
                        hip_l = 180 - abs(float(vals[col_map["hip_flexion_l"]]))
                        accumulators["left_hip"].append(hip_l)
                    if "knee_angle_r" in col_map:
                        knee_r = 180 - abs(float(vals[col_map["knee_angle_r"]]))
                        accumulators["right_knee"].append(knee_r)
                    if "knee_angle_l" in col_map:
                        knee_l = 180 - abs(float(vals[col_map["knee_angle_l"]]))
                        accumulators["left_knee"].append(knee_l)
                except (ValueError, IndexError):
                    continue
            n_files += 1
        except Exception:
            continue

    if n_files == 0:
        print("  No .mot files found. Download AddBiomechanics subject data first.")
        return False

    print(f"  Processed {n_files} kinematics files")

    # Merge into existing index
    existing = {}
    if os.path.exists(INDEX_PATH):
        with open(INDEX_PATH) as f:
            existing = json.load(f)

    norms = existing.get("norms", {})
    for joint, values in accumulators.items():
        if len(values) < 50:
            continue
        arr = np.array(values)
        p5, p95 = np.percentile(arr, 5), np.percentile(arr, 95)
        # Weighted average with existing norms if present
        if joint in norms and norms[joint].get("n", 0) > 0:
            n_existing = norms[joint]["n"]
            n_new = len(arr)
            total = n_existing + n_new
            merged_mean = (norms[joint]["mean"] * n_existing + float(np.mean(arr)) * n_new) / total
            merged_std = float(np.sqrt(
                (n_existing * norms[joint]["std"]**2 + n_new * np.var(arr)) / total
            ))
            norms[joint]["mean"] = round(merged_mean, 1)
            norms[joint]["std"] = round(merged_std, 1)
            norms[joint]["n"] = total
        else:
            norms[joint] = {
                "mean": float(np.mean(arr)),
                "std":  float(np.std(arr)),
                "min":  float(p5),
                "max":  float(p95),
                "n":    len(arr),
                "name": CLINICAL_NORMS.get(joint, {}).get("name", joint),
            }
        print(f"  {joint}: {norms[joint]['mean']:.1f}° ± {norms[joint]['std']:.1f}° (n={norms[joint]['n']})")

    existing["norms"] = norms
    existing["source"] = existing.get("source", "") + "+AddBiomechanics"
    with open(INDEX_PATH, "w") as f:
        json.dump(existing, f, indent=2)

    print(f"✓ ROM index updated at {INDEX_PATH}")
    return True


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ROM Reference Engine")
    parser.add_argument("--build-index", action="store_true", help="Build ROM index from downloaded datasets")
    parser.add_argument("--test", action="store_true", help="Self-test with sample angles")
    args = parser.parse_args()

    if args.build_index:
        print("Building ROM index…\n")
        r24_ok = build_index_from_rehab24()
        ab_ok  = build_index_from_addbiomechanics()
        if not r24_ok and not ab_ok:
            print("\nNo datasets found. Download datasets first:")
            print("  python download_datasets.py rehab24")
            print("  python download_datasets.py addbiomech")
        else:
            print("\n✓ Index built. ROMReference will now use dataset-derived norms.")

    elif args.test:
        ref = ROMReference()
        test_angles = {
            "left_shoulder":  145.0,  # restricted
            "right_shoulder": 162.0,  # normal
            "left_hip":       165.0,  # normal
            "right_hip":      155.0,  # mild restriction
            "left_knee":      170.0,  # normal
            "right_knee":     170.0,  # normal
        }
        print(f"Reference source: {ref.source}")
        print(f"Test angles: {test_angles}\n")
        report = ref.generate_rom_report(test_angles, "Test Patient")
        print(json.dumps(report, indent=2))
    else:
        parser.print_help()
