"use client";

import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { useMemo, useState } from "react";
import {
  mapPieces,
  mapViewBox,
  regions,
  type MapPiece,
} from "./map-data";

const visibleMapPieces = mapPieces.filter(
  (piece) => piece.id !== "ireland-natural-earth",
);

const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = mapViewBox
  .split(" ")
  .map(Number) as [number, number, number, number];

type PopoutPlacement = {
  side: "left" | "right";
  vertical: "up" | "middle" | "down";
};

function getPopoutStyle(piece: MapPiece, accent: string) {
  const x = ((piece.labelX - viewBoxX) / viewBoxWidth) * 100;
  const y = ((piece.labelY - viewBoxY) / viewBoxHeight) * 100;

  return {
    "--panel-accent": accent,
    "--pin-x": `${x}%`,
    "--pin-y": `${y}%`,
  } as CSSProperties &
    Record<"--panel-accent" | "--pin-x" | "--pin-y", string>;
}

function getLabelBox(lines: string[]) {
  const width = Math.max(...lines.map((line) => line.length)) * 6.4 + 22;
  const height = lines.length * 14 + 14;

  return { height, width };
}

function getPopoutPlacement(piece: MapPiece): PopoutPlacement {
  const x = (piece.labelX - viewBoxX) / viewBoxWidth;
  const y = (piece.labelY - viewBoxY) / viewBoxHeight;

  return {
    side: x > 0.58 ? "left" : "right",
    vertical: y < 0.23 ? "down" : y > 0.73 ? "up" : "middle",
  };
}

export default function Home() {
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [hoveredPieceId, setHoveredPieceId] = useState<string | null>(null);

  const regionById = useMemo(
    () => new Map(regions.map((region) => [region.id, region])),
    [],
  );

  const pieceById = useMemo(
    () => new Map(visibleMapPieces.map((piece) => [piece.id, piece])),
    [],
  );

  const selectedPiece = selectedPieceId ? pieceById.get(selectedPieceId) : null;
  const selectedRegion = selectedPiece
    ? regionById.get(selectedPiece.regionId)
    : null;
  const placement = selectedPiece ? getPopoutPlacement(selectedPiece) : null;
  const selectedPieceName = selectedPiece
    ? selectedPiece.label.replace(/\n/g, " ") || selectedPiece.officialName
    : "";

  function selectPiece(pieceId: string) {
    setSelectedPieceId(pieceId);
  }

  function handlePageClick() {
    if (selectedPieceId) {
      setSelectedPieceId(null);
    }
  }

  function handleRegionClick(
    event: MouseEvent<SVGPathElement>,
    pieceId: string,
  ) {
    event.stopPropagation();
    selectPiece(pieceId);
  }

  function handleRegionKeyDown(
    event: KeyboardEvent<SVGPathElement>,
    pieceId: string,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectPiece(pieceId);
    }
  }

  return (
    <main className="catchment-shell" onClick={handlePageClick}>
      <section
        className="map-experience"
        aria-labelledby="map-page-title"
      >
        <h1 className="map-title" id="map-page-title">
          Valuations Team Coverage
        </h1>
        <div className="map-frame">
          <div className="map-stage">
          <svg
            className="catchment-map"
            viewBox={mapViewBox}
            role="img"
            aria-labelledby="catchment-title catchment-desc"
          >
            <title id="catchment-title">LSH catchment map</title>
            <desc id="catchment-desc">
              Interactive map of UK regions and Northern Ireland. Selecting a
              region shows the LSH contact details for that catchment.
            </desc>

            <g className="map-shadow" aria-hidden="true">
              {visibleMapPieces.map((piece) => (
                <path key={`${piece.id}-shadow`} d={piece.d} />
              ))}
            </g>

            <g className="region-layer">
              {visibleMapPieces.map((piece) => {
                const region = regionById.get(piece.regionId)!;
                const isSelected = piece.id === selectedPieceId;
                const isHovered = piece.id === hoveredPieceId;
                const isMuted =
                  hoveredPieceId !== null &&
                  piece.id !== hoveredPieceId &&
                  piece.id !== selectedPieceId;

                return (
                  <path
                    key={piece.id}
                    className={[
                      "region-shape",
                      isSelected ? "is-selected" : "",
                      isHovered ? "is-hovered" : "",
                      isMuted ? "is-muted" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    d={piece.d}
                    fillRule="evenodd"
                    role="button"
                    tabIndex={0}
                    aria-controls="region-contacts"
                    aria-label={`${piece.officialName}. ${region.name} contacts.`}
                    aria-pressed={isSelected}
                    onClick={(event) => handleRegionClick(event, piece.id)}
                    onMouseEnter={() => setHoveredPieceId(piece.id)}
                    onMouseLeave={() => setHoveredPieceId(null)}
                    onFocus={() => setHoveredPieceId(piece.id)}
                    onBlur={() => setHoveredPieceId(null)}
                    onKeyDown={(event) => handleRegionKeyDown(event, piece.id)}
                  />
                );
              })}
            </g>

            <g className="label-layer" aria-hidden="true">
              {visibleMapPieces
                .filter((piece) => piece.label.trim().length > 0)
                .map((piece) => {
                  const lines = piece.label.split("\n");
                  const box = getLabelBox(lines);
                  const boxX = piece.labelX - box.width / 2;
                  const boxY = piece.labelY - 13;

                  return (
                    <g
                      key={`${piece.id}-label`}
                      className={[
                        "map-label-group",
                        piece.id === selectedPieceId ? "is-selected" : "",
                        piece.id === hoveredPieceId ? "is-hovered" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <rect
                        className="map-label-bg"
                        x={boxX}
                        y={boxY}
                        width={box.width}
                        height={box.height}
                        rx="3"
                      />
                      <text
                        className="map-label-text"
                        x={piece.labelX}
                        y={boxY + 17}
                      >
                        {lines.map((line, index) => (
                          <tspan
                            key={`${piece.id}-${line}`}
                            x={piece.labelX}
                            dy={index === 0 ? 0 : 14}
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}
            </g>
          </svg>

          {selectedPiece && selectedRegion && placement ? (
            <aside
              id="region-contacts"
              className={[
                "contact-popout",
                `contact-popout--${placement.side}`,
                `contact-popout--${placement.vertical}`,
              ].join(" ")}
              aria-live="polite"
              aria-labelledby="region-contact-heading"
              style={getPopoutStyle(selectedPiece, "#cc2030")}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="contact-popout__body">
                <button
                  className="contact-popout__close"
                  type="button"
                  aria-label="Close contact details"
                  onClick={() => setSelectedPieceId(null)}
                />
                <h1 id="region-contact-heading">{selectedPieceName}</h1>
                <div className="contact-list">
                  {selectedRegion.contacts.map((contact) => (
                    <article className="contact-office" key={contact.office}>
                      <h2>{contact.office}</h2>
                      <div className="contact-people">
                        {contact.people.map((person) => (
                          <a
                            className="contact-person"
                            href={`mailto:${person.email}`}
                            key={person.email}
                          >
                            <span>{person.name}</span>
                            <small>{person.email}</small>
                          </a>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </aside>
          ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

