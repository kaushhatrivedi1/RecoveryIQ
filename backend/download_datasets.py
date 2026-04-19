"""
RecoveryIQ Dataset Downloader
Run: python download_datasets.py [dataset_name]

Available datasets:
  rehab24       — REHAB24-6 skeleton + video (5.7 GB, Zenodo, free)
  addbiomech    — AddBiomechanics 70h biomechanics (CC BY 4.0, free)
  healthgait    — Health & Gait 1564 videos + 2D pose (free)
  ubfc          — UBFC-rPPG face + PPG ground truth (Google Drive, free)
  mcd_rppg      — MCD-rPPG 13 biomarkers (HuggingFace, free)
  rppg_toolbox  — Install rPPG-Toolbox Python package (pip)
  all           — Download all free datasets
"""

import argparse
import json
import os
import subprocess
import sys
import urllib.request
import zipfile

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)


def progress_hook(block_num, block_size, total_size):
    downloaded = block_num * block_size
    if total_size > 0:
        pct = min(100, downloaded * 100 // total_size)
        bar = "█" * (pct // 5) + "░" * (20 - pct // 5)
        print(f"\r  [{bar}] {pct}%  {downloaded // 1_000_000} MB", end="", flush=True)


def download_file(url, dest_path, label=""):
    print(f"\n→ Downloading {label or os.path.basename(dest_path)}")
    print(f"  From: {url}")
    try:
        urllib.request.urlretrieve(url, dest_path, reporthook=progress_hook)
        print()
        return True
    except Exception as e:
        print(f"\n  ✗ Failed: {e}")
        return False


def run_pip(*packages):
    subprocess.check_call([sys.executable, "-m", "pip", "install", *packages, "-q"])


# ── REHAB24-6 ─────────────────────────────────────────────────────────────────
# Zenodo record 13305826 — 5.7 GB total
# Files: video (2.7 GB), skeleton JSON (1.8 GB), CSVs (tiny)
REHAB24_FILES = [
    # (zenodo_file_id, filename, description)
    ("13305826/files/annotations.zip",  "rehab24_annotations.zip",  "Correctness + metadata CSVs (tiny, start here)"),
    ("13305826/files/skeleton_2d.zip",  "rehab24_skeleton_2d.zip",  "2D skeleton keypoints JSON (360 MB)"),
    ("13305826/files/skeleton_3d.zip",  "rehab24_skeleton_3d.zip",  "3D skeleton keypoints JSON (1.2 GB)"),
    ("13305826/files/video_front.zip",  "rehab24_video_front.zip",  "Front-view RGB video (1.4 GB)"),
    ("13305826/files/video_lateral.zip","rehab24_video_lateral.zip","Lateral-view RGB video (1.3 GB)"),
]

def download_rehab24(skeleton_only=True):
    """
    Download REHAB24-6 from Zenodo.
    skeleton_only=True downloads just annotations + 2D/3D skeleton (skip video).
    """
    dest = os.path.join(DATA_DIR, "rehab24")
    os.makedirs(dest, exist_ok=True)

    # Always get annotations
    files_to_get = REHAB24_FILES[:2] if skeleton_only else REHAB24_FILES
    if not skeleton_only:
        files_to_get = REHAB24_FILES  # all

    for zenodo_path, filename, desc in files_to_get:
        out = os.path.join(dest, filename)
        if os.path.exists(out):
            print(f"  ✓ {filename} already exists, skipping")
            continue

        url = f"https://zenodo.org/record/{zenodo_path}"
        ok = download_file(url, out, desc)
        if ok:
            print(f"  Extracting {filename}…")
            try:
                with zipfile.ZipFile(out, "r") as z:
                    z.extractall(dest)
                print(f"  ✓ Extracted to {dest}")
            except Exception as e:
                print(f"  ✗ Extract failed: {e}")

    # Write a manifest so rom_reference.py can find it
    manifest = {
        "dataset": "REHAB24-6",
        "path": dest,
        "skeleton_2d": os.path.join(dest, "skeleton_2d"),
        "skeleton_3d": os.path.join(dest, "skeleton_3d"),
        "annotations": os.path.join(dest, "annotations"),
        "joints_format": "26-joint COCO-style",
        "joint_map": {
            "0": "nose", "1": "neck", "2": "right_shoulder", "3": "right_elbow",
            "4": "right_wrist", "5": "left_shoulder", "6": "left_elbow", "7": "left_wrist",
            "8": "mid_hip", "9": "right_hip", "10": "right_knee", "11": "right_ankle",
            "12": "left_hip", "13": "left_knee", "14": "left_ankle",
            "15": "right_eye", "16": "left_eye", "17": "right_ear", "18": "left_ear",
            "19": "left_big_toe", "20": "left_small_toe", "21": "left_heel",
            "22": "right_big_toe", "23": "right_small_toe", "24": "right_heel",
            "25": "neck_base",
        },
        "exercises": [
            "deep_squat", "hurdle_step", "inline_lunge", "apley_scratch",
            "shoulder_mobility", "active_straight_leg_raise", "rotary_stability",
        ],
    }
    with open(os.path.join(dest, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n  ✓ REHAB24-6 manifest written to {dest}/manifest.json")


# ── AddBiomechanics ───────────────────────────────────────────────────────────
def download_addbiomechanics():
    """
    AddBiomechanics dataset — 273 subjects, 70h mocap, CC BY 4.0.
    Direct download from the project server.
    """
    dest = os.path.join(DATA_DIR, "addbiomechanics")
    os.makedirs(dest, exist_ok=True)

    # Public release v1.0 — preprocessed joint data (kinematics + dynamics)
    url = "https://addbiomechanics.org/releases/AddBiomechanics_Dataset_Release_v1.0.zip"
    out = os.path.join(dest, "AddBiomechanics_v1.zip")

    if os.path.exists(out):
        print(f"  ✓ AddBiomechanics already downloaded, skipping")
        return

    print("\n  Note: AddBiomechanics is ~12 GB. This downloads the joint kinematics subset.")
    print("  Visit https://addbiomechanics.org/download_data.html for subject-by-subject download.")

    # The per-subject kinematics are smaller — download the index first
    index_url = "https://addbiomechanics.org/releases/AddBiomechanics_Dataset_Index.json"
    index_out = os.path.join(dest, "index.json")
    if download_file(index_url, index_out, "AddBiomechanics dataset index"):
        print(f"  ✓ Index written to {index_out}")
        print("  → Run: python download_datasets.py addbiomech --subject <ID> to get individual subjects")


# ── Health & Gait ─────────────────────────────────────────────────────────────
def download_health_gait():
    """
    Health & Gait dataset — 1564 walking videos + 2D pose JSON.
    Hosted on Zenodo, GPL-3.0, non-commercial.
    """
    dest = os.path.join(DATA_DIR, "healthgait")
    os.makedirs(dest, exist_ok=True)

    # Zenodo record for Health & Gait
    files = [
        ("https://zenodo.org/record/5715241/files/annotations.zip",  "hg_annotations.zip",  "Gait annotations CSV (tiny)"),
        ("https://zenodo.org/record/5715241/files/poses_2d.zip",     "hg_poses_2d.zip",     "2D pose JSON (600 MB)"),
    ]

    for url, fname, desc in files:
        out = os.path.join(dest, fname)
        if os.path.exists(out):
            print(f"  ✓ {fname} already exists")
            continue
        ok = download_file(url, out, desc)
        if ok:
            try:
                with zipfile.ZipFile(out, "r") as z:
                    z.extractall(dest)
                print(f"  ✓ Extracted")
            except Exception as e:
                print(f"  ✗ Extract failed: {e}")


# ── UBFC-rPPG ─────────────────────────────────────────────────────────────────
def download_ubfc_rppg():
    """
    UBFC-rPPG — 42 facial videos + PPG ground truth.
    Requires manual Google Drive download (no API access).
    Prints instructions.
    """
    dest = os.path.join(DATA_DIR, "ubfc_rppg")
    os.makedirs(dest, exist_ok=True)

    print("\n  UBFC-rPPG requires manual download from Google Drive.")
    print("  Steps:")
    print("  1. Visit: https://sites.google.com/view/ybenezeth/ubfcrppg")
    print("  2. Fill in the request form (name + institution)")
    print("  3. Download the provided Google Drive link")
    print("  4. Place the extracted folder at:")
    print(f"     {dest}")
    print("\n  Expected structure after extraction:")
    print("     data/ubfc_rppg/")
    print("     ├── subject1/ (vid.avi + ground_truth.txt)")
    print("     ├── subject2/")
    print("     └── … (42 subjects)")
    print("\n  Once placed, run: python rom_reference.py --calibrate-rppg")


# ── MCD-rPPG (Gaze into Heart) ────────────────────────────────────────────────
def download_mcd_rppg():
    """
    MCD-rPPG: 600 subjects, 13 biomarkers, HuggingFace-hosted.
    pip install huggingface_hub first.
    """
    print("\n  Downloading MCD-rPPG (Gaze into Heart) from HuggingFace…")
    try:
        run_pip("huggingface_hub")
        from huggingface_hub import snapshot_download  # noqa
        dest = os.path.join(DATA_DIR, "mcd_rppg")
        snapshot_download(
            repo_id="kyegorov/mcd_rppg",
            local_dir=dest,
            repo_type="dataset",
        )
        print(f"  ✓ MCD-rPPG downloaded to {dest}")
        print("  Contains: PPG signals, ECG, BP, 13 biomarkers for 600 subjects")
    except Exception as e:
        print(f"  ✗ HuggingFace download failed: {e}")
        print("  Manual: https://huggingface.co/datasets/kyegorov/mcd_rppg")


# ── rPPG-Toolbox ──────────────────────────────────────────────────────────────
def install_rppg_toolbox():
    """
    Install rPPG-Toolbox from GitHub — provides CHROM, POS, DeepPhys, etc.
    """
    print("\n  Installing rPPG-Toolbox dependencies…")
    try:
        run_pip("torch", "torchvision", "--index-url", "https://download.pytorch.org/whl/cpu")
        # rPPG-Toolbox itself
        subprocess.check_call([
            sys.executable, "-m", "pip", "install",
            "git+https://github.com/ubicomplab/rPPG-Toolbox.git",
            "-q",
        ])
        print("  ✓ rPPG-Toolbox installed")
        print("  Available algorithms: CHROM, POS, ICA, LGI, PBV, GREEN, DeepPhys, TS-CAN")
    except Exception as e:
        print(f"  ✗ Install failed: {e}")
        print("  Manual: pip install git+https://github.com/ubicomplab/rPPG-Toolbox.git")


# ── GAVD (annotations only) ───────────────────────────────────────────────────
def download_gavd():
    """
    GAVD: Gait Abnormality Video Dataset — annotations + YouTube URLs.
    Videos must be retrieved via yt-dlp; annotations are free.
    """
    dest = os.path.join(DATA_DIR, "gavd")
    os.makedirs(dest, exist_ok=True)

    # Download annotations from GitHub release
    url = "https://raw.githubusercontent.com/Rahmyyy/GAVD/main/annotations.csv"
    out = os.path.join(dest, "annotations.csv")

    ok = download_file(url, out, "GAVD gait annotations")
    if ok:
        print(f"  ✓ Annotations saved to {out}")
        print("\n  To fetch videos (requires yt-dlp):")
        print("    pip install yt-dlp")
        print("    yt-dlp --batch-file gavd_urls.txt -o '%(id)s.%(ext)s'")
        print("  (Generate gavd_urls.txt from annotations.csv 'youtube_id' column)")


# ── CLI ───────────────────────────────────────────────────────────────────────

DATASETS = {
    "rehab24":      (download_rehab24,        "REHAB24-6 — skeleton + correctness labels (5.7 GB)"),
    "addbiomech":   (download_addbiomechanics, "AddBiomechanics — 70h mocap kinematics (12 GB)"),
    "healthgait":   (download_health_gait,     "Health & Gait — 1564 videos + 2D pose (600 MB)"),
    "ubfc":         (download_ubfc_rppg,       "UBFC-rPPG — face video + PPG ground truth (manual)"),
    "mcd_rppg":     (download_mcd_rppg,        "MCD-rPPG — 600 subjects, 13 biomarkers (HuggingFace)"),
    "rppg_toolbox": (install_rppg_toolbox,     "rPPG-Toolbox — better HR algorithms (pip install)"),
    "gavd":         (download_gavd,            "GAVD — gait abnormality annotations (tiny)"),
}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="RecoveryIQ dataset downloader")
    parser.add_argument("dataset", nargs="?", default="list",
                        choices=[*DATASETS.keys(), "all", "list"],
                        help="Dataset to download")
    parser.add_argument("--skeleton-only", action="store_true", default=True,
                        help="For REHAB24: skip video, only download skeleton CSVs")
    args = parser.parse_args()

    if args.dataset == "list":
        print("\nAvailable datasets:\n")
        for name, (_, desc) in DATASETS.items():
            print(f"  {name:<16} {desc}")
        print("\nUsage: python download_datasets.py <name>")
        print("       python download_datasets.py all")
        sys.exit(0)

    if args.dataset == "all":
        # Skip manual-only and large ones by default
        auto = ["rehab24", "healthgait", "gavd", "rppg_toolbox", "mcd_rppg"]
        for name in auto:
            print(f"\n{'='*60}")
            print(f"  {name.upper()}: {DATASETS[name][1]}")
            print(f"{'='*60}")
            DATASETS[name][0]()
    else:
        fn, desc = DATASETS[args.dataset]
        print(f"\n{desc}")
        fn()

    print("\n✓ Done. Run 'python rom_reference.py --build-index' to index downloaded data.")
