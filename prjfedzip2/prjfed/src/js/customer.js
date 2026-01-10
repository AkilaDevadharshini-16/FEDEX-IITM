/***********************
 * AUTH CHECK
 ***********************/
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "customer") {
  window.location.href = "login.html";
}

/***********************
 * TOKEN
 ***********************/
const token = localStorage.getItem("token");

/***********************
 * API
 ***********************/
const API_URL = "http://localhost:5000/api/cases";

/***********************
 * DATA
 ***********************/
let cases = [];

/***********************
 * ELEMENTS
 ***********************/
const table = document.getElementById("customerTable");
const totalAmountEl = document.getElementById("totalAmount");
const currentStatusEl = document.getElementById("currentStatus");
const approvalStatusEl = document.getElementById("approvalStatus");

/***********************
 * RENDER
 ***********************/
function renderCustomer() {
  table.innerHTML = "";

  const myCases = cases.filter(
    c => c.customerUsername === user.username
  );

  if (myCases.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="6" class="p-4 text-center text-gray-500">
          No debt cases assigned
        </td>
      </tr>
    `;
    totalAmountEl.textContent = "₹0";
    currentStatusEl.textContent = "—";
    approvalStatusEl.textContent = "—";
    return;
  }

  let total = 0;

  myCases.forEach(c => {
    total += Number(c.amount);

    table.innerHTML += `
      <tr class="border-t">
        <td class="p-2">${c.dcaUsername}</td>
        <td class="p-2">₹${c.amount}</td>
        <td class="p-2">${new Date(c.dueDate).toLocaleDateString()}</td>
        <td class="p-2">${c.status}</td>
        <td class="p-2">${c.approvalStatus || "—"}</td>

        <!-- ✅ PAYMENT PROOF COLUMN (ADDED) -->
        <td class="p-2">
          ${
            c.paymentProof
              ? `<a href="http://localhost:5000/${c.paymentProof}"
                   target="_blank"
                   class="text-purple-700 underline text-sm">
                   View
                 </a>`
              : `<input type="file"
                   onchange="uploadProof('${c._id}', this.files[0])" />`
          }
        </td>
      </tr>
    `;

    currentStatusEl.textContent = c.status;
    approvalStatusEl.textContent = c.approvalStatus || "—";
  });

  totalAmountEl.textContent = `₹${total}`;
}

/***********************
 * FETCH CASES
 ***********************/
async function fetchCases() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    cases = await res.json();
    renderCustomer();
  } catch (err) {
    console.error(err);
    alert("Failed to load customer cases");
  }
}

/***********************
 * UPLOAD PAYMENT PROOF (ADDED)
 ***********************/
async function uploadProof(caseId, file) {
  if (!file) return;

  const formData = new FormData();
  formData.append("paymentProof", file);

  try {
    await fetch(`${API_URL}/${caseId}/upload-proof`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token
      },
      body: formData
    });

    alert("Payment proof uploaded successfully");
    fetchCases(); // refresh UI (no page reload)
  } catch (err) {
    console.error(err);
    alert("Upload failed");
  }
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
