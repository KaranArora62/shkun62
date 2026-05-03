import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import "../IncomeTax.css";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import PurSummPrint from "./PurSummPrint";
import useCompanySetup from "../../Shared/useCompanySetup";
import InputMask from "react-input-mask";
import financialYear from "../../Shared/financialYear";
import * as XLSX from "sheetjs-style";
import {
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Paper,
  Typography,
  Box,
  Stack,
  Divider,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FieldCustomizeModal from "../../Shared/FieldCustomizeModal";

const tenant = "03AAYFG4472A1ZG_01042025_31032026";
const API_URL = `https://www.shkunweb.com/shkunlive/${tenant}/tenant/api/purchase`;
const LEDGER_API_URL = `https://www.shkunweb.com/shkunlive/${tenant}/tenant/api/ledgerAccount`;

export default function PartyWiseSummPur({ show, onClose }) {
  const { dateFrom, companyName, companyAdd, companyCity } = useCompanySetup();
  // form state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rawValue, setRawValue] = useState("");
  const [toRaw, setToRaw] = useState("");

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Auto-set financial year when component loads
  useEffect(() => {
    const fy = financialYear.getFYDates();
    setFromDate(formatDate(fy.start));
    setToDate(formatDate(fy.end));
    setRawValue(formatDate(fy.start));
    setToRaw(formatDate(fy.end));
  }, []);

  const getVcode = (supplier) => {
    return String(supplier?.Vcode ?? "").trim();
  };
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [agent, setAgent] = useState("");
  const [isB2B, setIsB2B] = useState(false);
  const [reportType, setReportType] = useState("With GST");
  const [taxType, setTaxType] = useState("All");
  const [orderBy, setOrderBy] = useState("");
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [lessDrCrNote, setLessDrCrNote] = useState(false);
  const [summaryType, setSummaryType] = useState("total");

  const [fieldModalOpen, setFieldModalOpen] = useState(false);

  const DEFAULT_FIELD_DATA = [
    {
      id: 1,
      checked: true,
      fieldName: "supplierName",
      description: "Supplier",
      width: 180,
      serialNo: 1,
      total: false,
      bold: false,
    },
    {
      id: 2,
      checked: true,
      fieldName: "city",
      description: "City",
      width: 120,
      serialNo: 2,
      total: false,
      bold: false,
    },
    {
      id: 3,
      checked: false,
      fieldName: "gstno",
      description: "GST No",
      width: 150,
      serialNo: 3,
      total: false,
      bold: false,
    },
    {
      id: 4,
      checked: false,
      fieldName: "pan",
      description: "PAN",
      width: 120,
      serialNo: 4,
      total: false,
      bold: false,
    },
    {
      id: 5,
      checked: true,
      fieldName: "bags",
      description: "Bags",
      width: 90,
      serialNo: 5,
      total: true,
      bold: false,
    },
    {
      id: 6,
      checked: true,
      fieldName: "qty",
      description: "Qty",
      width: 90,
      serialNo: 6,
      total: true,
      bold: false,
    },
    {
      id: 7,
      checked: true,
      fieldName: "value",
      description: "Value",
      width: 120,
      serialNo: 7,
      total: true,
      bold: false,
    },
    {
      id: 8,
      checked: false,
      fieldName: "igst",
      description: "IGST",
      width: 100,
      serialNo: 8,
      total: true,
      bold: false,
    },
    {
      id: 9,
      checked: false,
      fieldName: "cgst",
      description: "CGST",
      width: 100,
      serialNo: 9,
      total: true,
      bold: false,
    },
    {
      id: 10,
      checked: false,
      fieldName: "sgst",
      description: "SGST",
      width: 100,
      serialNo: 10,
      total: true,
      bold: false,
    },
    {
      id: 11,
      checked: false,
      fieldName: "tax",
      description: "Tax",
      width: 100,
      serialNo: 11,
      total: true,
      bold: false,
    },
    {
      id: 12,
      checked: false,
      fieldName: "grandtotal",
      description: "Grand Total",
      width: 130,
      serialNo: 12,
      total: true,
      bold: false,
    },
    { id: 13, checked: false, fieldName: "email", description: "Email", width: 180, serialNo: 13, total: false, bold: false },
    { id: 14, checked: false, fieldName: "phone", description: "Phone", width: 120, serialNo: 14, total: false, bold: false },
    { id: 15, checked: false, fieldName: "address", description: "Address", width: 220, serialNo: 15, total: false, bold: false },
    { id: 16, checked: false, fieldName: "pinCode", description: "Pin Code", width: 100, serialNo: 16, total: false, bold: false },
    { id: 17, checked: false, fieldName: "contactPerson", description: "Contact Person", width: 160, serialNo: 17, total: false, bold: false },
    { id: 18, checked: false, fieldName: "bsgroup", description: "BS Group", width: 160, serialNo: 18, total: false, bold: false },
    { id: 19, checked: false, fieldName: "payLimit", description: "Pay Limit", width: 100, serialNo: 19, total: true, bold: false },
    { id: 20, checked: false, fieldName: "payDuedays", description: "Due Days", width: 100, serialNo: 20, total: false, bold: false },
  ];

  const [fieldOptions, setFieldOptions] = useState(() => {
    const saved = localStorage.getItem("purSumFieldOptions");
    return saved ? JSON.parse(saved) : DEFAULT_FIELD_DATA;
  });

  useEffect(() => {
    localStorage.setItem(
      "purSumFieldOptions",
      JSON.stringify(fieldOptions),
    );
  }, [fieldOptions]);

  function updateLabel(key, newLabel) {
    setFieldOptions((prev) =>
      prev.map((f) => (f.key === key ? { ...f, label: newLabel } : f)),
    );
  }

  const [selectedFields, setSelectedFields] = useState([
    "supplierName",
    "city",
    "bags",
    "qty",
    "value",
  ]);

  function toggleField(key) {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
    );
  }

  function getExtraFields(rec, ledgerMap) {
  const supplier = rec.supplierdetails?.[0] || {};
  const formData = rec.formData || {};

  const vcode = String(supplier.Vcode || "").trim();
  const ledger = ledgerMap?.get(vcode) || {};

  const d = parseAnyDate(formData.date);

  const formattedDate = d
    ? `${String(d.getDate()).padStart(2, "0")}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}-${d.getFullYear()}`
    : "";

  const month = d
    ? d.toLocaleString("en-IN", { month: "short", year: "numeric" })
    : "";

  return {
    supplierName: supplier.vacode || ledger.ahead || "",
    gstno: supplier.gstno || ledger.gstNo || "",
    pan: supplier.pan || ledger.pan || "",
    city: supplier.city || ledger.city || "",
    state: supplier.state || ledger.state || "",

    // Ledger API extra fields
    email: ledger.email || "",
    phone: ledger.phone || "",
    address: ledger.add1 || "",
    pinCode: ledger.pinCode || "",
    contactPerson: ledger.cperson || "",
    bsgroup: ledger.Bsgroup || "",
    payLimit: ledger.payLimit || 0,
    payDuedays: ledger.payDuedays || 0,

    date: formattedDate,
    month,

    vtype: formData.vtype || "",
    vno: formData.vno || "",
    stype: formData.stype || "",
    trpt: formData.trpt || "",

    cgst: parseFloat(formData.cgst) || 0,
    sgst: parseFloat(formData.sgst) || 0,
    igst: parseFloat(formData.igst) || 0,
    tax: parseFloat(formData.tax) || 0,
    grandtotal: parseFloat(formData.grandtotal) || 0,
  };
}
  // function getExtraFields(rec) {
  //   const supplier = rec.supplierdetails?.[0] || {};
  //   const formData = rec.formData || {};

  //   const d = parseAnyDate(formData.date);
  //   const formattedDate = d
  //     ? `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`
  //     : "";

  //   const month = d
  //     ? d.toLocaleString("en-IN", { month: "short", year: "numeric" })
  //     : "";

  //   return {
  //     supplierName: supplier.vacode || "",
  //     gstno: supplier.gstno || "",
  //     pan: supplier.pan || "",
  //     city: supplier.city || "",
  //     state: supplier.state || "",

  //     date: formattedDate,
  //     month,

  //     vtype: formData.vtype || "",
  //     vno: formData.vno || "",
  //     stype: formData.stype || "",
  //     trpt: formData.trpt || "",

  //     cgst: parseFloat(formData.cgst) || 0,
  //     sgst: parseFloat(formData.sgst) || 0,
  //     igst: parseFloat(formData.igst) || 0,
  //     tax: parseFloat(formData.tax) || 0,
  //     grandtotal: parseFloat(formData.grandtotal) || 0,
  //   };
  // }

  // Ledger selection modal state
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [ledgers, setLedgers] = useState([]); // All ledger names from API
  const [selectedLedgers, setSelectedLedgers] = useState([]); // Only checked
  const [ledgerSearch, setLedgerSearch] = useState(""); // Search input
  const [selectAll, setSelectAll] = useState(false); // Select All toggle

  // Print preview modal state
  const [printOpen, setPrintOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [groupedData, setGroupedData] = useState([]);
  const [error, setError] = useState("");

  // ref for react-to-print
  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Purchase Summary",
  });

  // Date change handles
  const handleChange = (e) => {
    setRawValue(e.target.value);

    const [d, m, y] = e.target.value.split("/");
    if (d.length === 2 && m.length === 2 && y.length === 4) {
      const dateObj = new Date(`${y}-${m}-${d}`);
      if (!isNaN(dateObj.getTime())) setFromDate(dateObj);
    }
  };

  const handleToChange = (e) => {
    const val = e.target.value;
    setToRaw(val);

    const [d, m, y] = val.split("/");
    if (d.length === 2 && m.length === 2 && y.length === 4) {
      const dateObj = new Date(`${y}-${m}-${d}`);
      if (!isNaN(dateObj.getTime())) setToDate(dateObj);
    }
  };

  // Called when user clicks Print on main modal
  async function onOpenPrint() {
    setError("");
    setFetching(true);
    setPrintOpen(true); // open modal immediately (spinner shows)

    try {
      const [purchaseRes, ledgerRes] = await Promise.all([
  axios.get(API_URL),
  axios.get(LEDGER_API_URL),
]);

let arr = Array.isArray(purchaseRes.data) ? purchaseRes.data : [];

const ledgerArr = Array.isArray(ledgerRes.data?.data)
  ? ledgerRes.data.data
  : [];

const ledgerMap = new Map();

ledgerArr.forEach((ledger) => {
  const fd = ledger.formData || {};
  ledgerMap.set(String(fd.acode || "").trim(), fd);
});

      // ⭐ FILTER BY CITY & STATE (case-insensitive)
      const filterCity = city.trim().toLowerCase();
      const filterState = stateName.trim().toLowerCase();

      arr = arr.filter((rec) => {
        const supplier = rec.supplierdetails?.[0] || {};
        const apiCity = (supplier.city || "").trim().toLowerCase();
        const apiState = (supplier.state || "").trim().toLowerCase();

        let cityMatch = true;
        if (filterCity !== "") cityMatch = apiCity === filterCity;

        let stateMatch = true;
        if (filterState !== "") stateMatch = apiState === filterState;

        return cityMatch && stateMatch;
      });

      // FILTER BY LEDGERS IF SELECTED
      if (selectedLedgers.length > 0) {
        arr = arr.filter((rec) => {
          const supplier = rec.supplierdetails?.[0] || {};
          const vcode = getVcode(supplier); // ✅ FIX
          return selectedLedgers.includes(vcode);
        });
      }

      // Agent Filter
      if (agent.trim() !== "") {
        const ag = agent.trim().toLowerCase();
        arr = arr.filter((rec) =>
          (rec.formData?.broker || "").toLowerCase().includes(ag),
        );
      }

      /* ⭐⭐⭐ TAX TYPE FILTER BASED ON DROPDOWN ⭐⭐⭐ */
      if (taxType !== "All") {
        const t = taxType.trim().toLowerCase();

        arr = arr.filter((rec) => {
          const apiTaxType = (rec.formData?.stype || "").trim().toLowerCase();
          return apiTaxType === t;
        });
      }

      const savedFieldData =
        JSON.parse(localStorage.getItem("purSumFieldData")) ||
        DEFAULT_FIELD_DATA;

      const selectedFieldData = savedFieldData
        .filter((f) => f.checked)
        .sort((a, b) => Number(a.serialNo) - Number(b.serialNo));

      // GROUP AFTER FILTERING
      let grouped = [];

      if (summaryType === "total") {
        grouped = groupBySupplier( arr, { minQty, maxQty, minValue, maxValue }, reportType, ledgerMap);
      } else if (summaryType === "month") {
        grouped = groupByMonth(arr, reportType, ledgerMap);
      } else if (summaryType === "date") {
        grouped = groupByDate(arr, reportType, ledgerMap);
      } else if (summaryType === "account") {
        grouped = groupBySupplier(
          arr,
          { minQty, maxQty, minValue, maxValue },
          reportType,ledgerMap,
        ).sort((a, b) => a.supplierName.localeCompare(b.supplierName));
      }
      setGroupedData(grouped);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch purchase data. Check console.");
    } finally {
      setFetching(false);
    }
  }

  // Grouping function
  function groupBySupplier(apiArray = [], filters = {}, reportType, ledgerMap) {
    const map = new Map();

    apiArray.forEach((rec) => {
      const supplier = rec.supplierdetails?.[0] || {};

      const vcode = getVcode(supplier); // ✅ FIX
      const name = (supplier.vacode || "Unknown Supplier").trim();
      const city = supplier.city || "";
      const pan = supplier.pan || "";

      const items = Array.isArray(rec.items) ? rec.items : [];

      let sums = { bags: 0, qty: 0, value: 0 };

      if (reportType === "Without GST") {
        sums = items.reduce(
          (acc, it) => {
            acc.bags += parseFloat(it.pkgs) || 0;
            acc.qty += parseFloat(it.weight) || 0;
            acc.value += parseFloat(it.amount) || 0;
            return acc;
          },
          { bags: 0, qty: 0, value: 0 },
        );
      } else {
        sums.bags = items.reduce((a, it) => a + (parseFloat(it.pkgs) || 0), 0);
        sums.qty = items.reduce((a, it) => a + (parseFloat(it.weight) || 0), 0);

        const grand = parseFloat(rec.formData?.grandtotal);
        sums.value = isNaN(grand) ? 0 : grand;
      }

      const { minQty, maxQty, minValue, maxValue } = filters;

      if (minQty && sums.qty < parseFloat(minQty)) return;
      if (maxQty && sums.qty > parseFloat(maxQty)) return;
      if (minValue && sums.value < parseFloat(minValue)) return;
      if (maxValue && sums.value > parseFloat(maxValue)) return;

      if (!map.has(vcode)) {
        map.set(vcode, {
          ...getExtraFields(rec, ledgerMap),
          supplierName: name,
          vcode,
          city,
          pan,
          bags: sums.bags,
          qty: sums.qty,
          value: sums.value,
        });
      } else {
        const ex = map.get(vcode);
        ex.bags += sums.bags;
        ex.qty += sums.qty;
        ex.value += sums.value;
      }
    });

    return Array.from(map.values());
  }

  function groupByDate(apiArray = [], reportType, ledgerMap) {
    return apiArray.map((rec) => {
      const supplier = rec.supplierdetails?.[0] || {};
      const vcode = getVcode(supplier); // ✅ FIX

      const items = rec.items ?? [];

      const bags = items.reduce((a, it) => a + (parseFloat(it.pkgs) || 0), 0);
      const qty = items.reduce((a, it) => a + (parseFloat(it.weight) || 0), 0);

      let value = 0;
      if (reportType === "With GST") {
        value = parseFloat(rec.formData?.grandtotal) || 0;
      } else {
        value = items.reduce((a, it) => a + (parseFloat(it.amount) || 0), 0);
      }

      const d = parseAnyDate(rec.formData?.date);
      const formattedDate = d
        ? `${String(d.getDate()).padStart(2, "0")}-${String(
            d.getMonth() + 1,
          ).padStart(2, "0")}-${d.getFullYear()}`
        : "";
      return {
        ...getExtraFields(rec, ledgerMap),
        date: formattedDate,
        bags,
        qty,
        value,
        supplier: supplier.vacode || "",
        supplierName: supplier.vacode || "",
        vcode,
      };
    });
  }

  // helper: parse DD/MM/YYYY or ISO -> Date object (returns null if invalid)
  function parseAnyDate(dateStr) {
    if (!dateStr) return null;

    if (dateStr instanceof Date) {
      return isNaN(dateStr.getTime()) ? null : dateStr;
    }

    const s = String(dateStr).trim();

    // ✅ DD-MM-YYYY or DD/MM/YYYY
    const dmy = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
    const dmyMatch = s.match(dmy);

    if (dmyMatch) {
      const day = Number(dmyMatch[1]);
      const month = Number(dmyMatch[2]) - 1;
      const year = Number(dmyMatch[3]);

      const dt = new Date(year, month, day);
      return isNaN(dt.getTime()) ? null : dt;
    }

    // ✅ ISO format: 2026-04-29T00:00:00.000Z
    const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/;
    const isoMatch = s.match(iso);

    if (isoMatch) {
      const year = Number(isoMatch[1]);
      const month = Number(isoMatch[2]) - 1;
      const day = Number(isoMatch[3]);

      const dt = new Date(year, month, day);
      return isNaN(dt.getTime()) ? null : dt;
    }

    return null;
  }

  // GROUP BY MONTH + Supplier Name + City
  function groupByMonth(apiArray = [], reportType, ledgerMap) {
    const map = new Map();

    apiArray.forEach((rec) => {
      const dateStr = rec.formData?.date || rec.date || "";
      const d = parseAnyDate(dateStr);
      if (!d) return;

      const monthKey = d.toLocaleString("en-IN", {
        month: "short",
        year: "numeric",
      });

      const supplier = rec.supplierdetails?.[0] || {};
      const vcode = getVcode(supplier); // ✅ FIX
      const supplierName = (supplier.vacode || "Unknown Supplier").trim();
      const city = supplier.city || "";

      const key = `${monthKey}__${vcode}`; // ✅ FIX

      const items = Array.isArray(rec.items) ? rec.items : [];

      const bags = items.reduce((a, it) => a + (parseFloat(it.pkgs) || 0), 0);
      const qty = items.reduce((a, it) => a + (parseFloat(it.weight) || 0), 0);

      let value = 0;
      if (reportType === "With GST") {
        value = parseFloat(rec.formData?.grandtotal) || 0;
      } else {
        value = items.reduce((a, it) => a + (parseFloat(it.amount) || 0), 0);
      }

      if (!map.has(key)) {
        map.set(key, {
          ...getExtraFields(rec, ledgerMap),
          month: monthKey,
          supplierName,
          vcode,
          city,
          bags,
          qty,
          value,
        });
      } else {
        const ex = map.get(key);
        ex.bags += bags;
        ex.qty += qty;
        ex.value += value;
      }
    });

    return Array.from(map.values());
  }

  const format = (d) => {
    if (!d) return "";
    if (d instanceof Date) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yy = d.getFullYear();
      return `${dd}/${mm}/${yy}`;
    }
    return d;
  };

  useEffect(() => {
    axios.get(API_URL).then((res) => {
      if (Array.isArray(res.data)) {
        const list = res.data
          .map((r) => {
            const supplier = r.supplierdetails?.[0] || {};
            return {
              vcode: getVcode(supplier), // ✅ FIX
              vacode: supplier.vacode || "",
              city: supplier.city || "",
            };
          })
          .filter((x) => x.vcode !== "");

        // remove duplicates by vcode
        const unique = [];
        const map = new Map();

        for (const item of list) {
          if (!map.has(item.vcode)) {
            map.set(item.vcode, true);
            unique.push(item);
          }
        }

        setLedgers(unique);

        // select all default
        setSelectedLedgers(unique.map((x) => x.vcode));
        setSelectAll(true);
      }
    });
  }, []);

  // Toggle single ledger
  function toggleLedger(vcode) {
    setSelectedLedgers((prev) =>
      prev.includes(vcode) ? prev.filter((x) => x !== vcode) : [...prev, vcode],
    );
  }

  // helper: currently visible (filtered) ledgers based on search
  function getVisibleLedgers() {
    const q = (ledgerSearch || "").toLowerCase();
    return ledgers.filter(
      (x) =>
        x.vacode.toLowerCase().includes(q) ||
        (x.city || "").toLowerCase().includes(q),
    );
  }

  // Select all
  function toggleSelectAll() {
    const visible = getVisibleLedgers();

    // ✅ USE VCODE (NOT vacode)
    const visibleVcodes = visible.map((x) => x.vcode);

    const allVisibleSelected =
      visibleVcodes.length > 0 &&
      visibleVcodes.every((v) => selectedLedgers.includes(v));

    if (allVisibleSelected) {
      // ❌ remove visible vcodes
      setSelectedLedgers((prev) =>
        prev.filter((v) => !visibleVcodes.includes(v)),
      );
      setSelectAll(false);
    } else {
      // ✅ add visible vcodes
      setSelectedLedgers((prev) => {
        const set = new Set(prev);
        visibleVcodes.forEach((v) => set.add(v));
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

    const visibleVcodes = visible.map((x) => x.vcode);

    const allVisibleSelected = visibleVcodes.every((v) =>
      selectedLedgers.includes(v),
    );

    setSelectAll(allVisibleSelected);
  }, [ledgerSearch, ledgers, selectedLedgers]);

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
  // function exportToExcel(filename, jsonData) {
  //   if (!jsonData || jsonData.length === 0) {
  //     alert("No data to export");
  //     return;
  //   }

  //   // ⭐ 1️⃣ CUSTOM HEADER NAMES
  //   const customHeaders = {
  //     supplierName: "Supplier",
  //     city: "City",
  //     pan: "PAN No",
  //     bags: "Bags",
  //     qty: "Quantity",
  //     value: "Total Value",
  //     month: "Month",
  //     date: "Date",
  //     supplier: "Supplier",
  //   };

  //   // Convert keys → readable headers
  //   const finalData = jsonData.map((row) => {
  //     const newRow = {};
  //     Object.keys(row).forEach((k) => {
  //       newRow[customHeaders[k] || k] = row[k];
  //     });
  //     return newRow;
  //   });

  //   let header = Object.keys(finalData[0]);

  //   if (summaryType === "date") {
  //     // Reorder columns: put Supplier right after Date
  //     const newOrder = ["Date", "Supplier"];

  //     // Keep all other columns in original order
  //     const remaining = header.filter((h) => !newOrder.includes(h));

  //     header = [...newOrder, ...remaining]; // ✅ Now allowed
  //   }

  //   // 2️⃣ COMPANY & PERIOD TOP ROWS
  //   const sheetData = [
  //     [companyName || "Company Name"],
  //     [companyAdd || "Company Address"],
  //     [`PURCHASE SUMMARY - Period From: ${fromDate}  To: ${toDate}`],
  //     [],
  //     header,
  //     ...finalData.map((row) => header.map((h) => row[h])),
  //   ];

  //   // 3️⃣ SUBTOTAL TOTAL ROW (BOTTOM)
  //   const numericColumns = ["Bags", "Quantity", "Total Value"];
  //   const totals = {};

  //   header.forEach((h, index) => {
  //     if (index === 0) {
  //       totals[h] = "Total";
  //     } else if (numericColumns.includes(h)) {
  //       const colLetter = XLSX.utils.encode_col(index);
  //       const firstRow = 5;
  //       const lastDataRow = 4 + finalData.length;
  //       totals[h] = {
  //         f: `SUBTOTAL(9,${colLetter}${firstRow + 1}:${colLetter}${lastDataRow + 1})`,
  //       };
  //     } else {
  //       totals[h] = "";
  //     }
  //   });

  //   sheetData.push(header.map((h) => totals[h]));

  //   // Build worksheet
  //   const ws = XLSX.utils.aoa_to_sheet(sheetData);

  //   // ⭐ APPLY STYLING TO TOP ROWS

  //   const totalColumns = header.length - 1;

  //   // A1 → Company Name (Font 16, Bold, Center)
  //   if (ws["A1"]) {
  //     ws["A1"].s = {
  //       font: { bold: true, sz: 16 },
  //       alignment: { horizontal: "center", vertical: "center" },
  //     };
  //   }

  //   // A2 → Company Address (Font 12, Bold, Center)
  //   if (ws["A2"]) {
  //     ws["A2"].s = {
  //       font: { bold: true, sz: 12 },
  //       alignment: { horizontal: "center", vertical: "center" },
  //     };
  //   }

  //   // A3 → Period Row (Font 12, Bold, Center)
  //   if (ws["A3"]) {
  //     ws["A3"].s = {
  //       font: { bold: true, sz: 12 },
  //       alignment: { horizontal: "center", vertical: "center" },
  //     };
  //   }

  //   // Merge Top 3 Rows
  //   ws["!merges"] = [
  //     { s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns } }, // Company Name
  //     { s: { r: 1, c: 0 }, e: { r: 1, c: totalColumns } }, // Address
  //     { s: { r: 2, c: 0 }, e: { r: 2, c: totalColumns } }, // Period
  //   ];

  //   // 4️⃣ COLUMN WIDTHS (AUTO-FIT)

  //   ws["!cols"] = header.map((h) => {
  //     const maxLen = Math.max(
  //       h.length,
  //       ...finalData.map((row) => (row[h] ? row[h].toString().length : 0)),
  //     );
  //     return { wch: maxLen + 3 };
  //   });

  //   const HEADER_BG = "4F81BD";

  //   // 5️⃣ HEADER STYLE
  //   header.forEach((_, colIdx) => {
  //     const addr = XLSX.utils.encode_cell({ r: 4, c: colIdx });
  //     if (ws[addr]) {
  //       ws[addr].s = {
  //         font: { bold: true, color: { rgb: "FFFFFF" } },
  //         fill: { patternType: "solid", fgColor: { rgb: HEADER_BG } },
  //         alignment: { horizontal: "center" },
  //         border: {
  //           top: { style: "thin" },
  //           bottom: { style: "thin" },
  //           left: { style: "thin" },
  //           right: { style: "thin" },
  //         },
  //       };
  //     }
  //   });

  //   // 6️⃣ NUMERIC ALIGNMENT & BORDERS
  //   const range = XLSX.utils.decode_range(ws["!ref"]);

  //   for (let R = 5; R <= range.e.r; R++) {
  //     for (let C = 0; C < header.length; C++) {
  //       const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
  //       if (!cell) continue;

  //       const isNumeric = numericColumns.includes(header[C]);

  //       cell.s = {
  //         alignment: {
  //           horizontal: isNumeric ? "right" : "left",
  //           vertical: "center",
  //         },
  //       };

  //       if (isNumeric && !isNaN(cell.v)) {
  //         cell.t = "n";
  //         cell.z = "0.00";
  //       }
  //     }
  //   }

  //   // 7️⃣ TOTAL ROW STYLE
  //   const totalRowIndex = finalData.length + 5;

  //   header.forEach((_, colIdx) => {
  //     const addr = XLSX.utils.encode_cell({ r: totalRowIndex, c: colIdx });
  //     if (ws[addr]) {
  //       ws[addr].s = {
  //         font: { bold: true },
  //         fill: { patternType: "solid", fgColor: { rgb: "D9D9D9" } },
  //         alignment: { horizontal: colIdx === 0 ? "left" : "right" },
  //       };
  //     }
  //   });

  //   // 8️⃣ MERGE COMPANY NAME / ADD / PERIOD ROWS
  //   ws["!merges"] = [
  //     { s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } },
  //     { s: { r: 1, c: 0 }, e: { r: 1, c: header.length - 1 } },
  //     { s: { r: 2, c: 0 }, e: { r: 2, c: header.length - 1 } },
  //   ];

  //   // 9️⃣ CREATE FILE
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Purchase Summary");

  //   XLSX.writeFile(wb, filename + ".xlsx");
  // }
  function exportToExcel(filename, jsonData) {
  if (!jsonData || jsonData.length === 0) {
    alert("No data to export");
    return;
  }

  const savedFieldData =
    JSON.parse(localStorage.getItem("purSumFieldData")) ||
    DEFAULT_FIELD_DATA;

  let visibleFields = savedFieldData
    .filter((f) => f.checked)
    .sort((a, b) => Number(a.serialNo || 0) - Number(b.serialNo || 0))
    .map((f) => ({
      key: f.fieldName,
      label: f.description,
      width: Number(f.width) || 100,
      total: f.total,
      bold: f.bold,
    }));

  // Auto add Month / Date according to summaryType
  if (summaryType === "month") {
    visibleFields = [
      { key: "month", label: "Month", width: 100, total: false, bold: true },
      ...visibleFields.filter((f) => f.key !== "month" && f.key !== "date"),
    ];
  }

  if (summaryType === "date") {
    visibleFields = [
      { key: "date", label: "Date", width: 100, total: false, bold: true },
      ...visibleFields.filter((f) => f.key !== "month" && f.key !== "date"),
    ];
  }

  if (summaryType !== "month" && summaryType !== "date") {
    visibleFields = visibleFields.filter(
      (f) => f.key !== "month" && f.key !== "date"
    );
  }

  const header = visibleFields.map((f) => f.label);

  const sheetData = [
    [companyName || "Company Name"],
    [companyAdd || "Company Address"],
    [`PURCHASE SUMMARY - Period From: ${fromDate} To: ${toDate}`],
    [],
    header,
    ...jsonData.map((row) =>
      visibleFields.map((field) => row[field.key] ?? "")
    ),
  ];

  // Total row
  const totalRow = visibleFields.map((field, index) => {
    if (index === 0) return "TOTAL";

    if (field.total) {
      const total = jsonData.reduce(
        (sum, row) => sum + (parseFloat(row[field.key]) || 0),
        0
      );
      return total;
    }

    return "";
  });

  sheetData.push(totalRow);

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: header.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: header.length - 1 } },
  ];

  // Column width from modal
  ws["!cols"] = visibleFields.map((field) => ({
    wch: Math.max(8, Math.round((Number(field.width) || 100) / 8)),
  }));

  const HEADER_ROW = 4;
  const DATA_START_ROW = 5;
  const TOTAL_ROW = sheetData.length - 1;

  // Top rows style
  ["A1", "A2", "A3"].forEach((cell, i) => {
    if (ws[cell]) {
      ws[cell].s = {
        font: { bold: true, sz: i === 0 ? 16 : 12 },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  });

  // Header style
  visibleFields.forEach((field, colIdx) => {
    const addr = XLSX.utils.encode_cell({ r: HEADER_ROW, c: colIdx });

    if (ws[addr]) {
      ws[addr].s = {
        font: {
          bold: true,
          color: { rgb: "FFFFFF" },
        },
        fill: {
          patternType: "solid",
          fgColor: { rgb: "4F81BD" },
        },
        alignment: {
          horizontal: numericFields.includes(field.key) ? "right" : "left",
        },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };
    }
  });

  // Body style
  for (let r = DATA_START_ROW; r < TOTAL_ROW; r++) {
    visibleFields.forEach((field, c) => {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];

      if (!cell) return;

      const isNumeric = numericFields.includes(field.key);

      cell.s = {
        font: {
          bold: field.bold || false,
        },
        alignment: {
          horizontal: isNumeric ? "right" : "left",
          vertical: "center",
        },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };

      if (isNumeric && !isNaN(Number(cell.v))) {
        cell.t = "n";
        cell.z = qtyFields.includes(field.key) ? "0.000" : "0.00";
      }
    });
  }

  // Total row style
  visibleFields.forEach((field, c) => {
    const addr = XLSX.utils.encode_cell({ r: TOTAL_ROW, c });
    const cell = ws[addr];

    if (!cell) return;

    cell.s = {
      font: { bold: true },
      fill: {
        patternType: "solid",
        fgColor: { rgb: "D9D9D9" },
      },
      alignment: {
        horizontal: numericFields.includes(field.key) ? "right" : "left",
      },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    if (field.total && numericFields.includes(field.key)) {
      cell.t = "n";
      cell.z = qtyFields.includes(field.key) ? "0.000" : "0.00";
    }
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Purchase Summary");

  XLSX.writeFile(wb, filename + ".xlsx");
}

  function handleExport() {
    if (summaryType === "total") {
      exportToExcel("Purchase_Total_Summary", groupedData);
    } else if (summaryType === "month") {
      exportToExcel("Purchase_Month_Wise", groupedData);
    } else if (summaryType === "date") {
      exportToExcel("Purchase_Date_Wise", groupedData);
    } else if (summaryType === "account") {
      exportToExcel("Purchase_Account_Wise", groupedData);
    }
  }

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
              Purchase Summary Party Wise
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filter purchase records and generate party-wise summary reports
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
                  value={rawValue}
                  onChange={handleChange}
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
                  value={toRaw}
                  onChange={handleToChange}
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

                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isB2B}
                        onChange={(e) => setIsB2B(e.target.checked)}
                      />
                    }
                    label="B2B"
                  />

                  <TextField
                    label="Agent"
                    value={agent}
                    onChange={(e) => setAgent(e.target.value)}
                    fullWidth
                    size="small"
                    sx={fieldSx}
                  />
                </Box>

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
                  value="total"
                  control={<Radio />}
                  label="Total Summary"
                />
                <FormControlLabel
                  value="month"
                  control={<Radio />}
                  label="Month Wise"
                />
                <FormControlLabel
                  value="date"
                  control={<Radio />}
                  label="Date Wise"
                />
                <FormControlLabel
                  value="account"
                  control={<Radio />}
                  label="Account Wise"
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
                      checked={lessDrCrNote}
                      onChange={(e) => setLessDrCrNote(e.target.checked)}
                    />
                  }
                  label="Less Dr/Cr Note"
                />
              </Stack>

              <Box
                sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}
              >
                <Button
                  variant="outline-secondary"
                  onClick={() => setLedgerModalOpen(true)}
                >
                  Select Ledgers
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => setFieldModalOpen(true)}
                >
                  Customize Fields
                </Button>
                <Button variant="primary" onClick={onOpenPrint}>
                  PRINT
                </Button>
                <Button variant="secondary" onClick={onClose}>
                  EXIT
                </Button>
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
        style={{ marginTop: 20 }}
        backdrop="static"
        keyboard={true}
      >
        <Modal.Body
          style={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}
        >
          {fetching ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              <div>
                <PurSummPrint
                  ref={printRef}
                  groupedData={groupedData}
                  fieldData={
                    JSON.parse(localStorage.getItem("purSumFieldData")) ||
                    DEFAULT_FIELD_DATA
                  }
                  summaryType={summaryType}
                  periodFrom={format(fromDate)}
                  periodTo={format(toDate)}
                  companyName={companyName}
                  companyAdd={companyAdd}
                  companyCity={companyCity}
                />
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="warning" onClick={handleExport}>
            EXPORT
          </Button>
          <Button
            variant="primary"
            onClick={handlePrint}
            disabled={fetching || groupedData.length === 0}
          >
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
              Select Ledger Accounts
            </Modal.Title>
            <div className="ledger-modal-subtitle">
              Search and select ledger accounts to include in the report.
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
                placeholder="Search by account name or city..."
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
                  <th>City</th>
                </tr>
              </thead>

              <tbody>
                {ledgers
                  .filter(
                    (x) =>
                      x.vacode
                        .toLowerCase()
                        .includes(ledgerSearch.toLowerCase()) ||
                      x.city.toLowerCase().includes(ledgerSearch.toLowerCase()),
                  )
                  .map((x, idx) => (
                    <tr key={idx}>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="ledger-checkbox"
                          checked={selectedLedgers.includes(x.vcode)}
                          onChange={() => toggleLedger(x.vcode)}
                        />
                      </td>
                      <td className="ledger-name">{x.vacode}</td>
                      <td>
                        <span className="ledger-city-badge">{x.city}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>

        <Modal.Footer className="ledger-modal-footer">
          <div className="ledger-selected-count">
            {selectedLedgers.length} ledger selected
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

      {/* Select Fields */}
      <FieldCustomizeModal
        show={fieldModalOpen}
        onHide={() => setFieldModalOpen(false)}
        defaultFieldData={DEFAULT_FIELD_DATA}
        storageKey="purSumFieldData"
      />
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
