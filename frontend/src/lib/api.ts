const BASE_URL = "http://localhost:8000";

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "서버 요청 실패");
  }
  return data;
}

export async function signup(userid: string, password: string) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid, password })
  });
  return handleResponse(res);
}

export async function login(userid: string, password: string) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid, password })
  });
  return handleResponse(res);
}

export async function interviewChat(
  job_title: string,
  resume_text: string,
  history: { role: string; content: string }[]
) {
  const res = await fetch(`${BASE_URL}/interview/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_title, resume_text, history })
  });
  return handleResponse(res);
}

export async function resumeAdjust(job_title: string, resume_text: string) {
  const res = await fetch(`${BASE_URL}/resume/adjust`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_title, resume_text })
  });
  return handleResponse(res);
}

export async function saveSession(
  session_id: string,
  role: string,
  content: string
) {
  const res = await fetch(`${BASE_URL}/session/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, role, content })
  });
  return handleResponse(res);
}

export async function loadSession(session_id: string) {
  const res = await fetch(`${BASE_URL}/session/load/${session_id}`);
  return handleResponse(res);
}