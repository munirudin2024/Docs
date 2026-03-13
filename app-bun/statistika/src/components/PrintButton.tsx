export default function PrintButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #print-area { margin: 0; padding: 0; }
        }
      `}</style>

      <div className="no-print" style={{ marginBottom: "16px" }}>
        <button
          onClick={handlePrint}
          style={{
            padding: "8px 20px",
            backgroundColor: "#1e3a5f",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          🖨️ Print / Save PDF
        </button>
      </div>
    </>
  )
}