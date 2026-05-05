// import { color } from "framer-motion";
// import React, { forwardRef } from "react";

// const tableStyle = {
//   width: "100%",
//   borderCollapse: "collapse",
//   fontSize: "18px",
// };

// const thtd = {
//   border: "1px solid black",
//   padding: "4px 6px",
// };

// const headerStyle = {
//   textAlign: "center",
//   marginBottom: "2px",
//   fontWeight: "bold",
//   fontSize: "35px",
//   fontFamily: "Courier New",
//   color:"darkblue"
// };

// const subHeader = {
//   textAlign: "center",
//   marginBottom: "5px",
//   fontSize: "22px",
//   fontFamily: "Courier New",
//   color:"darkblue"
// };

// const PurSummPrint = forwardRef(
//   (
//     {
//       groupedData,
//       periodFrom,
//       periodTo,
//       companyName,
//       companyAdd,
//       companyCity,
//     },
//     ref
//   ) => {
//     if (!groupedData || groupedData.length === 0) {
//       return (
//         <div ref={ref}>
//           <h5>No Records Found</h5>
//         </div>
//       );
//     }

//     // Detect summary type
//     const sample = groupedData[0];

//     const isMonthWise = sample.month !== undefined && sample.supplierName;
//     const isDateWise = sample.date !== undefined;
//     const isSupplierWise =
//       sample.supplierName !== undefined &&
//       !isMonthWise &&
//       !isDateWise;

//     // Totals
//     const totalBags = groupedData
//       .reduce((a, b) => a + (b.bags || 0), 0)
//       .toFixed(3);

//     const totalQty = groupedData
//       .reduce((a, b) => a + (b.qty || 0), 0)
//       .toFixed(3);

//     const totalValue = groupedData
//       .reduce((a, b) => a + (b.value || 0), 0)
//       .toFixed(2);

//     return (
//       <div ref={ref} style={{ padding: "20px" }}>
//         {/* HEADER */}
//         <div style={headerStyle}>{companyName}</div>
//         <div style={subHeader}>
//           {companyAdd}, {companyCity}
//         </div>
//         <div
//           style={{
//             display:'flex',
//             textAlign: "center",
//             marginBottom: "5px",
//             fontSize: "18px",
//             fontFamily: "Courier New",
//             justifyContent:'space-between'
//           }}
//         >
//           <strong>
//             Customer Wise Details
//           </strong>
//           <strong>
//             Sale Summary (From: {periodFrom} To: {periodTo})
//           </strong>
//         </div>

//         {/* TABLE */}
//         <table style={tableStyle}>
//           <thead>
//             {/* Month + Supplier Wise */}
//             {isMonthWise && (
//               <tr>
//                 <th style={thtd}>Month</th>
//                 <th style={thtd}>Supplier</th>
//                 <th style={thtd}>City</th>
//                 <th style={thtd}>Bags</th>
//                 <th style={thtd}>Qty</th>
//                 <th style={thtd}>Value</th>
//               </tr>
//             )}

//             {/* Date Wise */}
//             {isDateWise && (
//               <tr>
//                 <th style={thtd}>Date</th>
//                 <th style={thtd}>Supplier</th>
//                 <th style={thtd}>Bags</th>
//                 <th style={thtd}>Qty</th>
//                 <th style={thtd}>Value</th>
//               </tr>
//             )}

//             {/* Supplier Only */}
//             {isSupplierWise && (
//               <tr>
//                 <th style={thtd}>Supplier</th>
//                 <th style={thtd}>City</th>
//                 <th style={thtd}>PAN</th>
//                 <th style={thtd}>Bags</th>
//                 <th style={thtd}>Qty</th>
//                 <th style={thtd}>Value</th>
//               </tr>
//             )}
//           </thead>

//           <tbody>
//             {/* MONTH + SUPPLIER */}
//             {isMonthWise &&
//               groupedData.map((m, i) => (
//                 <tr key={i}>
//                   <td style={thtd}>{m.month}</td>
//                   <td style={thtd}>{m.supplierName}</td>
//                   <td style={thtd}>{m.city}</td>
//                   <td style={thtd}>{m.bags.toFixed(3)}</td>
//                   <td style={thtd}>{m.qty.toFixed(3)}</td>
//                   <td style={thtd}>{m.value.toFixed(2)}</td>
//                 </tr>
//               ))}

//             {/* DATE WISE */}
//             {isDateWise &&
//               groupedData.map((d, i) => (
//                 <tr key={i}>
//                   <td style={thtd}>{d.date}</td>
//                   <td style={thtd}>{d.supplier}</td>
//                   <td style={thtd}>{d.bags.toFixed(3)}</td>
//                   <td style={thtd}>{d.qty.toFixed(3)}</td>
//                   <td style={thtd}>{d.value.toFixed(2)}</td>
//                 </tr>
//               ))}

//             {/* SUPPLIER WISE */}
//             {isSupplierWise &&
//               groupedData.map((s, i) => (
//                 <tr key={i}>
//                   <td style={thtd}>{s.supplierName}</td>
//                   <td style={thtd}>{s.city}</td>
//                   <td style={thtd}>{s.pan}</td>
//                   <td style={thtd}>{s.bags.toFixed(3)}</td>
//                   <td style={thtd}>{s.qty.toFixed(3)}</td>
//                   <td style={thtd}>{s.value.toFixed(2)}</td>
//                 </tr>
//               ))}
//           </tbody>

//           {/* FOOTER TOTALS */}
//           <tfoot>
//             <tr>
//               <td
//                 style={{
//                   ...thtd,
//                   fontWeight: "bold",
//                   textAlign: "right",
//                 }}
//                 colSpan={
//                   isMonthWise
//                     ? 3
//                     : isSupplierWise
//                     ? 3
//                     : isDateWise
//                     ? 2
//                     : 1
//                 }
//               >
//                 TOTAL
//               </td>

//               <td style={thtd}>
//                 <strong>{totalBags}</strong>
//               </td>
//               <td style={thtd}>
//                 <strong>{totalQty}</strong>
//               </td>
//               <td style={thtd}>
//                 <strong>{totalValue}</strong>
//               </td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>
//     );
//   }
// );

// export default PurSummPrint;

import React, { forwardRef } from "react";

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "18px",
};

const thtd = {
  border: "1px solid black",
  padding: "4px 6px",
  wordBreak: "break-word",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "2px",
  fontWeight: "bold",
  fontSize: "35px",
  fontFamily: "Courier New",
  color: "darkblue",
};

const subHeader = {
  textAlign: "center",
  marginBottom: "5px",
  fontSize: "22px",
  fontFamily: "Courier New",
  color: "darkblue",
};

const numericFields = [
  "bags",
  "qty",
  "value",
  "cgst",
  "sgst",
  "igst",
  "tax",
  "grandtotal",
];

const qtyFields = ["bags", "qty"];

const PartyWisePrint = forwardRef(
  (
    {
      groupedData,
      fieldData = [],
      summaryType,
      periodFrom,
      periodTo,
      companyName,
      companyAdd,
      companyCity,
    },
    ref,
  ) => {
    if (!groupedData || groupedData.length === 0) {
      return (
        <div ref={ref}>
          <h5>No Records Found</h5>
        </div>
      );
    }

    let visibleFields = fieldData
      .filter((f) => f.checked)
      .sort((a, b) => Number(a.serialNo || 0) - Number(b.serialNo || 0))
      .map((f) => ({
        key: f.fieldName,
        label: f.description,
        width: Number(f.width) || 100,
        total: f.total,
        bold: f.bold,
      }));

    if (summaryType === "month") {
      visibleFields = [
        {
          key: "month",
          label: "Month",
          width: 100,
          total: false,
          bold: true,
        },
        ...visibleFields.filter((f) => f.key !== "month" && f.key !== "date"),
      ];
    }

    if (summaryType === "date") {
      visibleFields = [
        {
          key: "date",
          label: "Date",
          width: 100,
          total: false,
          bold: true,
        },
        ...visibleFields.filter((f) => f.key !== "month" && f.key !== "date"),
      ];
    }

    if (summaryType !== "month" && summaryType !== "date") {
      visibleFields = visibleFields.filter(
        (f) => f.key !== "month" && f.key !== "date",
      );
    }

    const totalOf = (key) =>
      groupedData.reduce((sum, row) => sum + (parseFloat(row[key]) || 0), 0);

    const formatValue = (key, value) => {
      if (!numericFields.includes(key)) return value || "";

      const num = parseFloat(value) || 0;

      if (qtyFields.includes(key)) {
        return num.toFixed(3);
      }

      return num.toFixed(2);
    };

    return (
      <div ref={ref} style={{ padding: "20px" }}>
        <div style={headerStyle}>{companyName}</div>

        <div style={subHeader}>
          {companyAdd}, {companyCity}
        </div>

        <div
          style={{
            display: "flex",
            textAlign: "center",
            marginBottom: "5px",
            fontSize: "18px",
            fontFamily: "Courier New",
            justifyContent: "space-between",
          }}
        >
          <strong>Customer Wise Details</strong>
          <strong>
            Purchase Summary (From: {periodFrom} To: {periodTo})
          </strong>
        </div>

        <table style={tableStyle}>
          <colgroup>
            {visibleFields.map((field) => (
              <col
                key={field.key}
                style={{
                  width: field.width ? `${field.width}px` : "auto",
                }}
              />
            ))}
          </colgroup>

          <thead>
            <tr>
              {visibleFields.map((field) => (
                <th
                  key={field.key}
                  style={{
                    ...thtd,
                    fontWeight: field.bold ? "bold" : "normal",
                    textAlign: numericFields.includes(field.key)
                      ? "right"
                      : "left",
                  }}
                >
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {groupedData.map((row, index) => (
              <tr key={index}>
                {visibleFields.map((field) => (
                  <td
                    key={field.key}
                    style={{
                      ...thtd,
                      fontWeight: field.bold ? "bold" : "normal",
                      textAlign: numericFields.includes(field.key)
                        ? "right"
                        : "left",
                    }}
                  >
                    {formatValue(field.key, row[field.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              {(() => {
                const firstTotalIndex = visibleFields.findIndex(
                  (field) => field.total && numericFields.includes(field.key),
                );

                const labelColSpan =
                  firstTotalIndex === -1
                    ? visibleFields.length
                    : firstTotalIndex;

                return (
                  <>
                    {labelColSpan > 0 && (
                      <td
                        colSpan={labelColSpan}
                        style={{
                          ...thtd,
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        TOTAL
                      </td>
                    )}

                    {visibleFields.slice(labelColSpan).map((field) => (
                      <td
                        key={field.key}
                        style={{
                          ...thtd,
                          fontWeight: "bold",
                          textAlign: numericFields.includes(field.key)
                            ? "right"
                            : "left",
                        }}
                      >
                        {field.total && numericFields.includes(field.key)
                          ? qtyFields.includes(field.key)
                            ? totalOf(field.key).toFixed(3)
                            : totalOf(field.key).toFixed(2)
                          : ""}
                      </td>
                    ))}
                  </>
                );
              })()}
            </tr>
          </tfoot>
        </table>
      </div>
    );
  },
);

export default PartyWisePrint;