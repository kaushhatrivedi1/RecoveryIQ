"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type BodyZone =
  | "head"
  | "neck"
  | "left-shoulder"
  | "right-shoulder"
  | "chest"
  | "left-arm"
  | "right-arm"
  | "left-forearm"
  | "right-forearm"
  | "abdomen"
  | "left-hand"
  | "right-hand"
  | "left-hip"
  | "right-hip"
  | "left-thigh"
  | "right-thigh"
  | "left-knee"
  | "right-knee"
  | "left-shin"
  | "right-shin"
  | "left-foot"
  | "right-foot";

const ZONE_LABELS: Record<BodyZone, string> = {
  head: "Head",
  neck: "Neck",
  "left-shoulder": "L. Shoulder",
  "right-shoulder": "R. Shoulder",
  chest: "Chest",
  "left-arm": "L. Upper Arm",
  "right-arm": "R. Upper Arm",
  "left-forearm": "L. Forearm",
  "right-forearm": "R. Forearm",
  abdomen: "Abdomen",
  "left-hand": "L. Hand",
  "right-hand": "R. Hand",
  "left-hip": "L. Hip",
  "right-hip": "R. Hip",
  "left-thigh": "L. Thigh",
  "right-thigh": "R. Thigh",
  "left-knee": "L. Knee",
  "right-knee": "R. Knee",
  "left-shin": "L. Lower Leg",
  "right-shin": "R. Lower Leg",
  "left-foot": "L. Foot",
  "right-foot": "R. Foot",
};

interface ZonePathProps {
  id: BodyZone;
  d: string;
  selected: boolean;
  hovered: boolean;
  onSelect: (id: BodyZone) => void;
  onHover: (id: BodyZone | null) => void;
}

function ZonePath({ id, d, selected, hovered, onSelect, onHover }: ZonePathProps) {
  return (
    <path
      d={d}
      onClick={() => onSelect(id)}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      fill={selected ? "rgba(184,124,90,0.55)" : hovered ? "rgba(201,168,124,0.30)" : "rgba(201,168,124,0.08)"}
      stroke={selected ? "#b87c5a" : hovered ? "#c9a87c" : "rgba(201,168,124,0.35)"}
      strokeWidth={selected ? "1.8" : "1.2"}
      style={{ cursor: "pointer", transition: "all 0.15s ease" }}
    />
  );
}

interface BodyMapProps {
  selected: BodyZone[];
  onToggle: (zone: BodyZone) => void;
  view?: "front" | "back";
}

export function BodyMap({ selected, onToggle, view = "front" }: BodyMapProps) {
  const [hovered, setHovered] = useState<BodyZone | null>(null);

  const isSelected = (id: BodyZone) => selected.includes(id);

  /**
   * SVG viewBox is 200 x 520.
   * Body is roughly centred at x=100.
   * All paths follow a simplified anatomical silhouette.
   */
  const zones: { id: BodyZone; d: string }[] = [
    // Head
    { id: "head", d: "M83,10 C83,5 117,5 117,10 L120,38 C120,50 80,50 80,38 Z" },
    // Neck
    { id: "neck", d: "M90,50 L87,68 L113,68 L110,50 Z" },
    // Left shoulder (mirror: patient's left = viewer's right)
    { id: "right-shoulder", d: "M87,68 L70,70 L60,100 L80,102 L87,85 Z" },
    // Right shoulder
    { id: "left-shoulder", d: "M113,68 L130,70 L140,100 L120,102 L113,85 Z" },
    // Chest
    { id: "chest", d: "M87,68 L113,68 L117,85 L115,108 L85,108 L83,85 Z" },
    // Left arm (upper)
    { id: "right-arm", d: "M60,100 L55,138 L72,140 L80,102 Z" },
    // Right arm (upper)
    { id: "left-arm", d: "M140,100 L145,138 L128,140 L120,102 Z" },
    // Left forearm
    { id: "right-forearm", d: "M55,138 L50,175 L68,177 L72,140 Z" },
    // Right forearm
    { id: "left-forearm", d: "M145,138 L150,175 L132,177 L128,140 Z" },
    // Left hand
    { id: "right-hand", d: "M50,175 L48,195 L55,198 L62,188 L68,177 Z" },
    // Right hand
    { id: "left-hand", d: "M150,175 L152,195 L145,198 L138,188 L132,177 Z" },
    // Abdomen
    { id: "abdomen", d: "M85,108 L115,108 L117,148 L83,148 Z" },
    // Left hip
    { id: "right-hip", d: "M83,148 L78,175 L97,177 L100,148 Z" },
    // Right hip
    { id: "left-hip", d: "M100,148 L117,148 L122,175 L103,177 Z" },
    // Left thigh
    { id: "right-thigh", d: "M78,175 L74,225 L92,227 L97,177 Z" },
    // Right thigh
    { id: "left-thigh", d: "M122,175 L126,225 L108,227 L103,177 Z" },
    // Left knee
    { id: "right-knee", d: "M74,225 L73,248 L93,249 L92,227 Z" },
    // Right knee
    { id: "left-knee", d: "M126,225 L127,248 L107,249 L108,227 Z" },
    // Left shin
    { id: "right-shin", d: "M73,248 L72,298 L91,299 L93,249 Z" },
    // Right shin
    { id: "left-shin", d: "M127,248 L128,298 L109,299 L107,249 Z" },
    // Left foot
    { id: "right-foot", d: "M72,298 L68,316 L92,317 L91,299 Z" },
    // Right foot
    { id: "left-foot", d: "M128,298 L132,316 L108,317 L109,299 Z" },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox="0 0 200 330"
        width="180"
        height="330"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Body outline silhouette (background) */}
        <g opacity="0.08">
          <ellipse cx="100" cy="25" rx="19" ry="20" fill="#5b7a85" />
          <rect x="80" y="44" width="40" height="20" rx="4" fill="#5b7a85" />
          <rect x="60" y="62" width="80" height="92" rx="8" fill="#5b7a85" />
          <rect x="38" y="68" width="26" height="112" rx="6" fill="#5b7a85" />
          <rect x="136" y="68" width="26" height="112" rx="6" fill="#5b7a85" />
          <rect x="80" y="152" width="20" height="80" rx="5" fill="#5b7a85" />
          <rect x="100" y="152" width="20" height="80" rx="5" fill="#5b7a85" />
          <rect x="79" y="230" width="20" height="86" rx="4" fill="#5b7a85" />
          <rect x="101" y="230" width="20" height="86" rx="4" fill="#5b7a85" />
        </g>

        {/* Clickable zones */}
        {zones.map((zone) => (
          <ZonePath
            key={zone.id}
            id={zone.id}
            d={zone.d}
            selected={isSelected(zone.id)}
            hovered={hovered === zone.id}
            onSelect={onToggle}
            onHover={setHovered}
          />
        ))}

        {/* Hover tooltip text */}
        {hovered && (
          <text
            x="100"
            y="325"
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="#b87c5a"
            fontFamily="system-ui, sans-serif"
          >
            {ZONE_LABELS[hovered]}
          </text>
        )}
      </svg>

      {/* Selected zone chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center max-w-[180px]">
          {selected.map((zone) => (
            <button
              key={zone}
              onClick={() => onToggle(zone)}
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-all"
              style={{ backgroundColor: "rgba(184,124,90,0.15)", color: "#b87c5a", border: "1px solid #c9a87c" }}
            >
              {ZONE_LABELS[zone]}
              <span className="ml-0.5 opacity-60">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
