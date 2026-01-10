  /***********************
   * AUTH CHECK
   ***********************/
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "manager") {
    window.location.href = "login.html";
  }

  /***********************
   * TOKEN
   ***********************/
  const token = localStorage.getItem("token");

  /***********************
   * API BASE URL
   ***********************/
  const API_URL = "http://localhost:5000/api/cases";

  /***********************
   * GLOBAL DATA
   ***********************/
  let cases = [];

  /***********************
   * ELEMENTS
   ***********************/
  const table = document.getElementById("caseTable");
  const modal = document.getElementById("timelineModal");
  const timelineList = document.getElementById("timelineList");
  const slaInfo = document.getElementById("slaInfo");

  const totalCasesEl = document.getElementById("totalCases");
  const overdueCasesEl = document.getElementById("overdueCases");
  const approvedCasesEl = document.getElementById("approvedCases");

  /***********************
   * SLA CHECK
   ***********************/
  function isOverdue(caseObj) {
    return (
      new Date() > new Date(caseObj.dueDate) &&
      caseObj.approvalStatus !== "Approved"
    );
  }

  /***********************
   * SUMMARY CARDS
   ***********************/
  function updateSummaryCards() {
    totalCasesEl.textContent = cases.length;
    overdueCasesEl.textContent = cases.filter(isOverdue).length;
    approvedCasesEl.textContent = cases.filter(
      c => c.approvalStatus === "Approved"
    ).length;
  }

  /***********************
   * RENDER TABLE  ✅ MOVED UP
   ***********************/
  function renderCases() {
    table.innerHTML = "";

    if (cases.length === 0) {
      table.innerHTML = `
        <tr>
          <td colspan="8" class="p-4 text-center text-gray-500">
            No cases available
          </td>
        </tr>`;
      updateSummaryCards();
      return;
    }

    cases.forEach(c => {
      const overdue = isOverdue(c);

      table.innerHTML += `
        <tr class="border-t ${overdue ? "bg-red-50" : ""}">
          <td class="p-2">${c.customerUsername}</td>
          <td class="p-2">${c.dcaUsername}</td>
          <td class="p-2">₹${c.amount}</td>
          <td class="p-2">${c.status}</td>

          <td class="p-2 font-semibold ${
            overdue ? "text-red-600" : "text-green-600"
          }">
            ${overdue ? "OVERDUE" : "On Time"}
          </td>

          <td class="p-2 text-center">
            ${
              c.approvalStatus === "Approved"
                ? `<span class="text-green-600 font-semibold">Approved</span>`
                : `<button onclick="approveCase('${c._id}')"
                    class="bg-green-600 text-white px-2 py-1 rounded text-sm">
                    Approve
                  </button>`
            }
          </td>

          <td class="p-2 text-center">
            <button onclick="viewTimeline('${c._id}')"
              class="bg-blue-600 text-white px-2 py-1 rounded text-sm">
              Timeline
            </button>
          </td>

          <td class="p-2 text-center space-x-2">
            <button onclick="updateCase('${c._id}', prompt('New amount:', ${c.amount}))"
              class="bg-yellow-500 text-white px-2 py-1 rounded text-sm">
              Edit
            </button>
            <button onclick="deleteCase('${c._id}')"
              class="bg-red-600 text-white px-2 py-1 rounded text-sm">
              Delete
            </button>
          </td>
        </tr>`;
    });

    updateSummaryCards();
  }

  /***********************
   * FETCH ALL CASES
   ***********************/
  async function fetchCases() {
    try {
      const res = await fetch(API_URL, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      cases = await res.json();
      renderCases();
    } catch (error) {
      alert("Failed to load cases");
      console.error(error);
    }
  }

  /***********************
   * ADD NEW CASE
   ***********************/
  async function handleAddCase() {
    const customer = document.getElementById("customerInput").value.trim();
    const dca = document.getElementById("dcaInput").value.trim();
    const amount = document.getElementById("amountInput").value;
    const dueDate = document.getElementById("dueDateInput").value;

    if (!customer || !dca || !amount || !dueDate) {
      alert("Please fill all fields");
      return;
    }

    const newCase = {
      customerUsername: customer,
      dcaUsername: dca,
      amount,
      status: "In Progress",
      approvalStatus: "",
      dueDate,
      history: [
        {
          action: "Case created",
          by: "Manager",
          date: new Date().toLocaleString()
        }
      ]
    };

    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(newCase)
    });

    fetchCases();

    ["customerInput", "dcaInput", "amountInput", "dueDateInput"].forEach(
      id => (document.getElementById(id).value = "")
    );
  }

  /***********************
   * DELETE CASE
   ***********************/
  async function deleteCase(id) {
    if (!confirm("Delete this case?")) return;

    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    });

    fetchCases();
  }

  /***********************
   * UPDATE CASE
   ***********************/
  async function updateCase(id, newAmount) {
    if (!newAmount || isNaN(newAmount)) return;

    const c = cases.find(cs => cs._id === id);
    if (!c) return;

    c.amount = newAmount;
    c.history.push({
      action: "Amount updated",
      by: "Manager",
      date: new Date().toLocaleString()
    });

    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(c)
    });

    fetchCases();
  }

  /***********************
   * APPROVE CASE
   ***********************/
  async function approveCase(id) {
    const c = cases.find(cs => cs._id === id);
    if (!c) return;

    if (c.status !== "Fully Paid") {
      alert("Case must be Fully Paid before approval");
      return;
    }

    c.approvalStatus = "Approved";
    c.history.push({
      action: "Case approved",
      by: "Manager",
      date: new Date().toLocaleString()
    });

    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(c)
    });

    fetchCases();
  }

  /***********************
   * INIT
   ***********************/
  fetchCases();
  /***********************
   * CHATBOT (FRONTEND ONLY)
   ***********************/
  function sendMessage() {
    const input = document.getElementById("chatInput");
    const messages = document.getElementById("chatMessages");

    // ✅ SAFETY CHECK (VERY IMPORTANT)
    if (!input || !messages) return;

    if (!input.value.trim()) return;

    // user message
    messages.innerHTML += `
      <div class="text-right text-purple-700">
        ${input.value}
      </div>
    `;

    const userText = input.value.toLowerCase();
    input.value = "";

    let reply = "I will help you with your case 😊";

    if (userText.includes("payment")) {
      reply = "You can upload payment proof in the Payment Proof column.";
    } else if (userText.includes("status")) {
      reply = "Your case status is shown in the dashboard.";
    } else if (userText.includes("help")) {
      reply = "You can ask about payments, status, or approvals.";
    }

    setTimeout(() => {
      messages.innerHTML += `
        <div class="text-gray-600">
          ${reply}
        </div>
      `;
      messages.scrollTop = messages.scrollHeight;
    }, 500);
  }
