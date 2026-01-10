/***********************
 * AUTH CHECK
 ***********************/
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "dca") {
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
const table = document.getElementById("dcaTable");

/***********************
 * RENDER
 ***********************/
function renderCases() {
  table.innerHTML = "";

  const assignedCases = cases.filter(
    c => c.dcaUsername === user.username
  );

  if (assignedCases.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="6" class="p-4 text-center text-gray-500">
          No cases assigned
        </td>
      </tr>`;
    return;
  }

  assignedCases.forEach(c => {
    table.innerHTML += `
      <tr class="border-t">
        <td class="p-2">${c.customerUsername}</td>
        <td class="p-2">₹${c.amount}</td>
        <td class="p-2">${new Date(c.dueDate).toLocaleDateString()}</td>
        <td class="p-2">${c.status}</td>
        <td class="p-2">${c.approvalStatus || "—"}</td>
        <td class="p-2 space-x-2">
          <button onclick="updateStatus('${c._id}', 'In Progress')"
            class="bg-blue-600 text-white px-2 py-1 rounded text-sm">
            In Progress
          </button>

          <button onclick="updateStatus('${c._id}', 'Fully Paid')"
            class="bg-green-600 text-white px-2 py-1 rounded text-sm">
            Fully Paid
          </button>
        </td>
      </tr>
    `;
  });
}

/***********************
 * FETCH CASES
 ***********************/
async function fetchCases() {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  cases = await res.json();
  renderCases();
}

/***********************
 * UPDATE STATUS
 ***********************/
async function updateStatus(id, status) {
  const c = cases.find(c => c._id === id);
  if (!c) return;

  c.status = status;
  c.history.push({
    action: `Status updated to ${status}`,
    by: user.username,
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
