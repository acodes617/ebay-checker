"use strict";
document.addEventListener("DOMContentLoaded", () => {
    /* ───────────────────────────────
       TYPES & STATE
    ─────────────────────────────── */
    const HISTORY_KEY = "ebayCheckerHistory";
    const state = {
        activeTab: "camera",
        stream: null,
        cartTotal: 0
    };
    /* ───────────────────────────────
       DOM HELPERS
    ─────────────────────────────── */
    function byId(id) {
        const el = document.getElementById(id);
        if (!el)
            throw new Error(`Missing element: ${id}`);
        return el;
    }
    function toNumber(val) {
        const n = parseFloat(val);
        return isNaN(n) ? 0 : n;
    }
    /* ───────────────────────────────
       ELEMENTS
    ─────────────────────────────── */
    // Tabs
    const cameraTab = byId("camera-tab");
    const calculatorTab = byId("calculator-tab");
    const historyTab = byId("history-tab");
    const navCamera = byId("nav-camera");
    const navCalculator = byId("nav-calculator");
    const navHistory = byId("nav-history");
    // Camera
    const video = byId("camera-video");
    const startCameraBtn = byId("camera-start");
    const captureBtn = byId("capture-button");
    const canvas = byId("capture-canvas");
    const ctx = canvas.getContext("2d");
    // Mini calculator
    const miniSale = byId("mini-sale-price");
    const miniCost = byId("mini-item-cost");
    const miniFee = byId("mini-fee-percent");
    const miniNet = byId("mini-net-profit");
    const miniCalcBtn = byId("mini-calc-btn");
    const miniAddCart = byId("mini-add-cart");
    const miniRecommended = byId("mini-recommended-price");
    const cartTotalSpan = byId("cart-total");
    // Full calculator
    const salePrice = byId("input-sale-price");
    const shippingCharged = byId("input-shipping-charged");
    const itemCost = byId("input-item-cost");
    const shippingCost = byId("input-shipping-cost");
    const feePercent = byId("input-fee-percent");
    const fixedFee = byId("input-fixed-fee");
    const totalFeesSpan = byId("total-fees");
    const netProfitSpan = byId("net-profit");
    const fullCalcBtn = byId("full-calc-btn");
    // History
    const historyList = byId("history-list");
    const historySearch = byId("history-search");
    /* ───────────────────────────────
       TAB MANAGEMENT
    ─────────────────────────────── */
    function setActiveTab(tab) {
        state.activeTab = tab;
        cameraTab.classList.toggle("active", tab === "camera");
        calculatorTab.classList.toggle("active", tab === "calculator");
        historyTab.classList.toggle("active", tab === "history");
        navCamera.classList.toggle("active", tab === "camera");
        navCalculator.classList.toggle("active", tab === "calculator");
        navHistory.classList.toggle("active", tab === "history");
        if (tab !== "camera")
            stopCamera();
    }
    navCamera.onclick = () => setActiveTab("camera");
    navCalculator.onclick = () => setActiveTab("calculator");
    navHistory.onclick = () => setActiveTab("history");
    /* ───────────────────────────────
       CAMERA (HARDENED)
    ─────────────────────────────── */
    async function startCamera() {
        if (state.stream)
            return;
        try {
            state.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" } },
                audio: false
            });
            video.srcObject = state.stream;
            await video.play();
            captureBtn.disabled = false;
        }
        catch (err) {
            alert("Camera access failed. Please allow permissions.");
            console.error(err);
        }
    }
    function stopCamera() {
        if (!state.stream)
            return;
        state.stream.getTracks().forEach(t => t.stop());
        state.stream = null;
        video.srcObject = null;
        captureBtn.disabled = true;
    }
    startCameraBtn.onclick = () => startCamera();
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopCamera();
        }
        else if (state.activeTab === "camera") {
            startCamera();
        }
    });
    /* ───────────────────────────────
       IMAGE CAPTURE + MOCK ANALYSIS
    ─────────────────────────────── */
    function detectItemType() {
        const types = ["Electronics", "Clothing", "Books"];
        return types[Math.floor(Math.random() * types.length)];
    }
    function suggestedFee(type) {
        if (type === "Electronics")
            return 12;
        if (type === "Clothing")
            return 10;
        return 15;
    }
    function suggestedPrice(cost, type) {
        if (type === "Electronics")
            return cost * 1.25;
        if (type === "Clothing")
            return cost * 1.5;
        return cost * 1.2;
    }
    captureBtn.onclick = () => {
        if (!video.videoWidth || !video.videoHeight)
            return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const type = detectItemType();
        const cost = toNumber(miniCost.value);
        miniFee.value = suggestedFee(type).toString();
        miniRecommended.textContent = suggestedPrice(cost, type).toFixed(2);
        calculateMini();
    };
    /* ───────────────────────────────
       MINI CALCULATOR
    ─────────────────────────────── */
    function calculateMini() {
        const sale = toNumber(miniSale.value);
        const cost = toNumber(miniCost.value);
        const fee = toNumber(miniFee.value);
        const net = sale - cost - (sale * fee / 100);
        miniNet.textContent = net.toFixed(2);
    }
    miniCalcBtn.onclick = calculateMini;
    /* ───────────────────────────────
       CART + HISTORY
    ─────────────────────────────── */
    function loadHistory() {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    function saveHistory(data) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
    }
    let history = loadHistory();
    function renderHistory(filter = "") {
        historyList.innerHTML = "";
        history
            .filter(h => h.price.toString().includes(filter))
            .forEach(h => {
            const div = document.createElement("div");
            div.className = "history-item";
            div.innerHTML = `
          <img src="${h.imageData}" width="80" />
          <div>
            $${h.price.toFixed(2)}<br/>
            ${new Date(h.date).toLocaleString()}
          </div>
        `;
            historyList.appendChild(div);
        });
    }
    renderHistory();
    miniAddCart.onclick = () => {
        const profit = parseFloat(miniNet.textContent || "0");
        state.cartTotal += profit;
        cartTotalSpan.textContent = state.cartTotal.toFixed(2);
        history.unshift({
            imageData: canvas.toDataURL("image/jpeg", 0.6),
            price: toNumber(miniSale.value),
            date: new Date().toISOString()
        });
        saveHistory(history);
        renderHistory();
    };
    historySearch.oninput = () => renderHistory(historySearch.value);
    /* ───────────────────────────────
       FULL CALCULATOR
    ─────────────────────────────── */
    fullCalcBtn.onclick = () => {
        const sale = toNumber(salePrice.value);
        const shipIn = toNumber(shippingCharged.value);
        const cost = toNumber(itemCost.value);
        const shipOut = toNumber(shippingCost.value);
        const feePct = toNumber(feePercent.value);
        const fixed = toNumber(fixedFee.value);
        const fees = (sale * feePct / 100) + fixed;
        const net = sale + shipIn - cost - shipOut - fees;
        totalFeesSpan.textContent = fees.toFixed(2);
        netProfitSpan.textContent = net.toFixed(2);
    };
});
