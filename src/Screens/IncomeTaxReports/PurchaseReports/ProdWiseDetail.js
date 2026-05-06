import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import axios from "axios";
import InputMask from "react-input-mask";
import PWiseDetailPrint from "./PwiseDetailPrint";
import { useReactToPrint } from "react-to-print";
import useCompanySetup from "../../Shared/useCompanySetup";
import financialYear from "../../Shared/financialYear";
import {
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Button as MuiButton,
  Paper,
  Typography,
  Box,
  Stack,
  Divider,
  InputAdornment,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const tenant = "03AAYFG4472A1ZG_01042025_31032026";
const API_URL = `https://www.shkunweb.com/shkunlive/${tenant}/tenant/api/purchase`;

export default function ProdWiseDetail({ show, onClose }) {
  const { companyName, companyAdd, companyCity } = useCompanySetup();
  // filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fy = financialYear.getFYDates();
    setFromDate(formatDate(fy.start)); // converted
    setToDate(formatDate(fy.end)); // converted
  }, []);

  const [summaryType, setSummaryType] = useState("gross");
  const [city, setCity] = useState("");
  const [reportType, setReportType] = useState("Without GST");
  const [stateName, setStateName] = useState("");
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [agent, setAgent] = useState("");
  const [taxType, setTaxType] = useState("All");
  const [lessDrCr, setLessDrCr] = useState(true);

  // Ledger selection modal state
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [ledgers, setLedgers] = useState([]); // All ledger names from API
  const [selectedLedgers, setSelectedLedgers] = useState([]); // Only checked
  const [ledgerSearch, setLedgerSearch] = useState(""); // Search input
  const [selectAll, setSelectAll] = useState(false); // Select All toggle

  // print modal
  const [printOpen, setPrintOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [groupedData, setGroupedData] = useState([]);

  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  function parseAnyDate(dateStr) {
    if (!dateStr) return null;

    // 1️⃣ dd/mm/yyyy
    if (dateStr.includes("/")) {
      const [d, m, y] = dateStr.split("/");
      return new Date(`${y}-${m}-${d}`);
    }

    // 2️⃣ dd-mm-yyyy
    if (dateStr.includes("-")) {
      const [a, b, c] = dateStr.split("-");

      // Check if first part is day or year
      // dd-mm-yyyy → a.length == 2
      // yyyy-mm-dd → a.length == 4
      if (a.length === 2) {
        const [d, m, y] = [a, b, c];
        return new Date(`${y}-${m}-${d}`);
      } else if (a.length === 4) {
        // yyyy-mm-dd
        return new Date(`${a}-${b}-${c}`);
      }
    }

    // 3️⃣ ISO (auto handled by JS)
    const auto = new Date(dateStr);
    if (!isNaN(auto)) return auto;

    return null; // invalid format
  }

  function summarizeAccountProductWise(purchases) {
    const result = {};

    purchases.forEach(p => {
      const supplier = p.supplierdetails?.[0] || {};

      const accountCode = supplier.Vcode || "UNKNOWN";
      const account = supplier.vacode || "UNKNOWN";
      const city = supplier.city || p.formData?.city || "";

      if (!result[accountCode]) {
        result[accountCode] = {
          accountCode,
          account,
          city,
          products: {},
          totalBags: 0,
          totalQty: 0,
          totalValue: 0,
        };
      }

      p.items.forEach(item => {
        const productCode = item.vcode || "UNKNOWN";
        const product = item.sdisc || "UNKNOWN";

        if (!result[accountCode].products[productCode]) {
          result[accountCode].products[productCode] = {
            productCode,
            product,
            bags: 0,
            qty: 0,
            value: 0,
          };
        }

        const bags = Number(item.pkgs || 0);
        const qty = Number(item.weight || 0);
        const value =
          reportType === "Without GST"
            ? Number(item.amount || 0)
            : Number(item.vamt || 0);

        result[accountCode].products[productCode].bags += bags;
        result[accountCode].products[productCode].qty += qty;
        result[accountCode].products[productCode].value += value;

        result[accountCode].totalBags += bags;
        result[accountCode].totalQty += qty;
        result[accountCode].totalValue += value;
      });
    });

    return Object.values(result).map(acc => ({
      ...acc,
      products: Object.values(acc.products),
    }));
  }

  // OPEN PRINT MODAL
  const onOpenPrint = () => {
    // ❗ Stop if dates are empty or incomplete
    if (
      !fromDate ||
      fromDate.includes("_") ||
      !toDate ||
      toDate.includes("_")
    ) {
      alert("Please select both From and To dates.");
      return;
    }

    setFetching(true);

    axios
      .get(API_URL)
      .then((res) => {
        let data = res.data;

        // DATE FILTER
        let from = parseAnyDate(fromDate);
        let to = parseAnyDate(toDate);

        const isValid = (d) => d instanceof Date && !isNaN(d);

        if (isValid(from) && isValid(to)) {
          data = data.filter((p) => {
            const apiDate = parseAnyDate(p.formData?.date);
            if (!isValid(apiDate)) return false;
            return apiDate >= from && apiDate <= to;
          });
        }

        // FILTER BY LEDGERS IF SELECTED
        if (selectedLedgers.length > 0) {
          data = data
            .map(rec => ({
              ...rec,
              items: rec.items?.filter(item =>
                selectedLedgers.includes(String(item.vcode))
              )
            }))
            .filter(rec => rec.items && rec.items.length > 0);
        }

        // CITY FILTER
        if (city.trim() !== "") {
          data = data.filter((p) => {
            const apiCity =
              p.supplierdetails?.[0]?.city || p.formData?.city || "";
            return apiCity.toLowerCase().includes(city.toLowerCase());
          });
        }
        // STATE FILTER
        if (stateName.trim() !== "") {
          data = data.filter((p) => {
            const apiState =
              p.supplierdetails?.[0]?.state || p.formData?.state || "";
            return apiState.toLowerCase().includes(stateName.toLowerCase());
          });
        }
        // Agent FILTER
        if (agent.trim() !== "") {
          data = data.filter((p) =>
            p.formData?.broker?.toLowerCase().includes(agent.toLowerCase()),
          );
        }
        // Tax Type FILTER
        if (taxType !== "All") {
          data = data.filter((p) => p.formData?.stype === taxType);
        }

        // GROUP SUMMARY
        let summary = [];

        if (summaryType === "gross") {
  summary = summarizeAccountProductWise(data);
        } else {
          const result = {};

          data.forEach(p => {
            const supplier = p.supplierdetails?.[0] || {};
            const accId = String(supplier.Vcode) || "UNKNOWN"
            const accName = supplier.vacode || "UNKNOWN";
            const city = supplier.city || "";

            if (!result[accId]) {
              result[accId] = {
                accId,
                account: accName,
                city,
                bills: []
              };
            }

            const bill = {
              billNo: p.formData?.vno,
              date: p.formData?.date,
              items: [],
              totalQty: 0,
              totalAmt: 0,
              totalGST: 0,
              totalValue: 0
            };

            (p.items || []).forEach(item => {
              const cases = Number(item.pkgs || 0);
              const qty = Number(item.weight || 0);
              const amt = Number(item.amount || 0);
              const cgst = Number(item.ctax || 0);
              const sgst = Number(item.stax || 0);
              const igst = Number(item.itax || 0);

              const gst = cgst + sgst + igst;
              const total = Number(item.vamt || 0);

              bill.items.push({
                product: item.sdisc,
                code: item.vcode,
                cases,
                qty,
                rate: Number(item.rate || 0),
                amt,
                gstRate: Number(item.gst || 0),
                gst,
                total
              });

              bill.totalCases += cases;
              bill.totalQty += qty;
              bill.totalAmt += amt;
              bill.totalGST += gst;
              bill.totalValue += total;
            });

            result[accId].bills.push(bill);
          });

          summary = Object.values(result);
        }

        // APPLY QTY / VALUE RANGE (same for all)
        if (minQty !== "")
          summary = summary.filter((r) => r.qty >= Number(minQty));
        if (maxQty !== "")
          summary = summary.filter((r) => r.qty <= Number(maxQty));
        if (minValue !== "")
          summary = summary.filter((r) => r.value >= Number(minValue));
        if (maxValue !== "")
          summary = summary.filter((r) => r.value <= Number(maxValue));

        setGroupedData(summary);
      })

      .catch(() => alert("Failed to load data"))

      .finally(() => {
        setFetching(false);
        setPrintOpen(true);
      });
  };

  useEffect(() => {
    axios.get(API_URL).then((res) => {
      if (Array.isArray(res.data)) {

        const list = res.data
          .flatMap(r =>
            (r.items || []).map(item => ({
              name: item.sdisc || "",
              code: item.vcode || ""
            }))
          )
          .filter(x => x.code !== "");

        const unique = [];
        const map = new Map();

        for (const item of list) {
          if (!map.has(item.code)) {
            map.set(item.code, true);
            unique.push(item);
          }
        }

        setLedgers(unique);
        setSelectedLedgers(unique.map(x => String(x.code)));
        setSelectAll(true);
      }
    });
  }, []);

  // Toggle single ledger
  function toggleLedger(code) {
    const strCode = String(code);

    setSelectedLedgers(prev =>
      prev.includes(strCode)
        ? prev.filter(x => x !== strCode)
        : [...prev, strCode]
    );
  }

  // helper: currently visible (filtered) ledgers based on search
  function getVisibleLedgers() {
    const q = (ledgerSearch || "").toLowerCase();
    return ledgers.filter(
      (x) =>
        x.name.toLowerCase().includes(q) ||
        (x.code + "").toLowerCase().includes(q),
    );
  }

  // Select all
  function toggleSelectAll() {
    const visible = getVisibleLedgers();
    const visibleCodes = visible.map(x => String(x.code));

    const allVisibleSelected =
      visibleCodes.length > 0 &&
      visibleCodes.every(v => selectedLedgers.includes(v));

    if (allVisibleSelected) {
      setSelectedLedgers(prev =>
        prev.filter(v => !visibleCodes.includes(v))
      );
      setSelectAll(false);
    } else {
      setSelectedLedgers(prev => {
        const set = new Set(prev);
        visibleCodes.forEach(v => set.add(v));
        return Array.from(set);
      });
      setSelectAll(true);
    }
  }

  useEffect(() => {
    const visible = getVisibleLedgers();
    if (visible.length === 0) {
      setSelectAll(false);
      return;
    }

    const visibleCodes = visible.map(x => String(x.code));
    const allVisibleSelected = visibleCodes.every(v =>
      selectedLedgers.includes(v)
    );

    setSelectAll(allVisibleSelected);
  }, [ledgerSearch, ledgers, selectedLedgers]);

  return (
    <>
      {/* MAIN FILTER MODAL */}
      <Modal
        show={show}
        onHide={onClose}
        size="xl"
        centered
        backdrop="static"
        keyboard
      >
        <Modal.Body
          style={{
            background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)",
            padding: "24px",
            borderRadius: "18px",
          }}
        >
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Typography variant="h5" fontWeight={800} color="#1e293b">
              Purchase Summary Product Wise Detailed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filter purchase records and generate product-wise summary reports
            </Typography>
          </Box>
  
          <Box sx={{ display: "flex", gap: 3 }}>
            <Paper sx={cardSx}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Basic Filters
              </Typography>
  
              <Stack spacing={2}>
                <InputMask
                  mask="99-99-9999"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                >
                  {(inputProps) => (
                    <TextField
                      {...inputProps}
                      label="From Date"
                      placeholder="dd-mm-yyyy"
                      fullWidth
                      size="small"
                      sx={fieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </InputMask>
  
                <InputMask
                  mask="99-99-9999"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                >
                  {(inputProps) => (
                    <TextField
                      {...inputProps}
                      label="Upto Date"
                      placeholder="dd-mm-yyyy"
                      fullWidth
                      size="small"
                      sx={fieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </InputMask>
  
                <TextField
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
  
                <TextField
                  label="State"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
                
                <TextField
                  label="Agent"
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
  
                <TextField
                  select
                  label="Report Type"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                >
                  <MenuItem value="With GST">With GST</MenuItem>
                  <MenuItem value="Without GST">Without GST</MenuItem>
                </TextField>
  
                <TextField
                  select
                  label="Tax Type"
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="GST Sale (RD)">GST Sale (RD)</MenuItem>
                  <MenuItem value="IGST Sale (RD)">IGST Sale (RD)</MenuItem>
                  <MenuItem value="GST (URD)">GST (URD)</MenuItem>
                  <MenuItem value="IGST (URD)">IGST (URD)</MenuItem>
                  <MenuItem value="Tax Free Within State">
                    Tax Free Within State
                  </MenuItem>
                  <MenuItem value="Tax Free Interstate">
                    Tax Free Interstate
                  </MenuItem>
                  <MenuItem value="Export Sale">Export Sale</MenuItem>
                  <MenuItem value="Export Sale(IGST)">
                    Export Sale(IGST)
                  </MenuItem>
                  <MenuItem value="Including GST">Including GST</MenuItem>
                  <MenuItem value="Including IGST">Including IGST</MenuItem>
                  <MenuItem value="Not Applicable">Not Applicable</MenuItem>
                  <MenuItem value="Exempted Sale">Exempted Sale</MenuItem>
                </TextField>
              </Stack>
            </Paper>
  
            <Paper sx={cardSx}>
              <Typography variant="subtitle1" fontWeight={700}>
                Summary Options
              </Typography>
  
              <RadioGroup
                row // ✅ makes everything in one line
                value={summaryType}
                onChange={(e) => setSummaryType(e.target.value)}
              >
                <FormControlLabel
                  value="gross"
                  control={<Radio />}
                  label="Gross"
                />
                <FormControlLabel
                  value="detailed"
                  control={<Radio />}
                  label="Detailed"
                />
              </RadioGroup>
  
              <Stack spacing={1}>
                <TextField
                  label="Min Qty"
                  value={minQty}
                  onChange={(e) => setMinQty(e.target.value)}
                  size="small"
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label="Max Qty"
                  value={maxQty}
                  onChange={(e) => setMaxQty(e.target.value)}
                  size="small"
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label="Min Value"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  size="small"
                  fullWidth
                  sx={fieldSx}
                />
                <TextField
                  label="Max Value"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  size="small"
                  fullWidth
                  sx={fieldSx}
                />
  
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={lessDrCr}
                      onChange={(e) => setLessDrCr(e.target.checked)}
                    />
                  }
                  label="Less Dr/Cr Note"
                />
              </Stack>
  
              <Box
                sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}
              >
                <MuiButton
                  variant="outlined"
                  onClick={() => setLedgerModalOpen(true)}
                >
                  Select Accounts
                </MuiButton>
                <MuiButton variant="contained" onClick={onOpenPrint}>
                  PRINT
                </MuiButton>
                <MuiButton variant="contained"
                  color="inherit" 
                  onClick={onClose}>
                  EXIT
                </MuiButton>
              </Box>
            </Paper>
          </Box>
        </Modal.Body>
      </Modal>

      {/* PRINT PREVIEW MODAL */}
      <Modal
        show={printOpen}
        onHide={() => setPrintOpen(false)}
        fullscreen
        className="custom-modal"
        style={{ marginTop: 20, overflow: "auto" }}
        backdrop="static"
        keyboard={true}
      >
        <Modal.Body
          style={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}
        >
          {fetching ? (
            <div style={{ overflow: "auto" }} className="text-center">
              Loading...
            </div>
          ) : (
            <PWiseDetailPrint
              ref={printRef}
              rows={groupedData}
              fromDate={fromDate}
              toDate={toDate}
              companyName={companyName}
              companyAdd={companyAdd}
              companyCity={companyCity}
              summaryType = {summaryType}
              tittle={"PRODUCT WISE DETAIL PURCHASE"}
            />
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handlePrint}>
            PRINT
          </Button>
          <Button variant="secondary" onClick={() => setPrintOpen(false)}>
            CLOSE
          </Button>
        </Modal.Footer>
      </Modal>

      {/* LEDGER SELECTION MODAL */}
      <Modal
        show={ledgerModalOpen}
        onHide={() => setLedgerModalOpen(false)}
        centered
        size="lg"
        dialogClassName="ledger-modern-modal"
      >
        <Modal.Header closeButton className="ledger-modal-header">
          <div>
            <Modal.Title className="ledger-modal-title">
              Select Accounts
            </Modal.Title>
            <div className="ledger-modal-subtitle">
              Search and select accounts to include in the report.
            </div>
          </div>
        </Modal.Header>
  
        <Modal.Body className="ledger-modal-body">
          <div className="ledger-search-box">
            <div className="ledger-search-wrapper">
              <span className="search-icon">🔍</span>
  
              <input
                type="text"
                className="ledger-search-input-modern"
                placeholder="Search by account name or aacount code..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
              />
  
              {ledgerSearch && (
                <span
                  className="clear-icon"
                  onClick={() => setLedgerSearch("")}
                >
                  ✖
                </span>
              )}
            </div>
          </div>
  
          <div className="ledger-table-wrapper">
            <Table className="ledger-modern-table" size="sm">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: "70px" }}>
                    Select
                  </th>
                  <th>Account Name</th>
                  <th>Ac Code</th>
                </tr>
              </thead>
  
              <tbody>
                {ledgers
                  .filter((x) => {
                    const search = ledgerSearch.toLowerCase();

                    return (
                      String(x.name || "").toLowerCase().includes(search) ||
                      String(x.code || "").toLowerCase().includes(search)
                    );
                  })
                  .map((x, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={selectedLedgers.includes(String(x.code))}
                          onChange={() => toggleLedger(String(x.code))}
                        />
                      </td>
                      <td>{x.name}</td>
                      <td>{x.code}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
  
        <Modal.Footer className="ledger-modal-footer">
          <div className="ledger-selected-count">
            {selectedLedgers.length} Account selected
          </div>
  
          <div className="ledger-footer-buttons">
            <Button
              variant={selectAll ? "warning" : "success"}
              onClick={toggleSelectAll}
            >
              {selectAll ? "Unselect All" : "Select All"}
            </Button>
  
            <Button
              variant="secondary"
              onClick={() => setLedgerModalOpen(false)}
            >
              Close
            </Button>
  
            <Button variant="primary" onClick={() => setLedgerModalOpen(false)}>
              Apply
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

const rowStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "10px",
};

const labelStyle = {
  width: "120px",
  fontWeight: "600",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#fff",
  },
};

const cardSx = {
  flex: 1,
  p: 2,
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  border: "1px solid #eef2f7",
};

