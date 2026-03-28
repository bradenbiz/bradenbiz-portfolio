import VirtualPlaza from "@/components/VirtualPlaza";

export default function HomePage() {
  return (
    <div
      style={{
        backgroundColor: "rgba(223, 153, 240, 1)",
        margin: 0,
        padding: 0,
        fontFamily: "'FiraMono', monospace",
        cursor: "none",
        overflow: "hidden",
        height: "calc(100vh - 64px)",
        position: "relative",
      }}
    >
      <VirtualPlaza />
    </div>
  );
}
