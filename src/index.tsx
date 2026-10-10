/*
 * model-hint — QwenPaw Web Console frontend plugin (source)
 *
 * NOTE: chat.response.append is NOT rendered by this Web Console build.
 * Use chat.actions (rendered in message footer). Usage at:
 *   message.cards.find(c => c.code==="AgentScopeRuntimeResponseCard").data.usage
 *
 * Each distinct model gets a deterministic macaron color. Font: Montserrat.
 */
const React = (window as any).QwenPaw?.host?.React;
const PLUGIN_ID = "model-hint";

(function ensureMontserrat() {
  try {
    const id = "model-hint-montserrat";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap";
      document.head.appendChild(link);
    }
  } catch (e) {}
})();

const MACARON = [
  { bg: "#F6E3F5", border: "#E7C6E8", text: "#B06AB8" },
  { bg: "#D7F0E3", border: "#B6E2CC", text: "#4C9A82" },
  { bg: "#FDF3D0", border: "#F2E3A6", text: "#C9A227" },
  { bg: "#D9ECF9", border: "#B9DBF0", text: "#3F8FC4" },
  { bg: "#FCE4D6", border: "#F6CDB4", text: "#D98659" },
  { bg: "#FADCE4", border: "#F4C2CF", text: "#D06A86" },
  { bg: "#E4E0F7", border: "#CDC6EF", text: "#7C6BC4" },
  { bg: "#DEF2F0", border: "#BFE4E0", text: "#3F9E95" },
  { bg: "#F3E8D8", border: "#E4D3BB", text: "#B08754" },
  { bg: "#E8F3D6", border: "#D4E7B4", text: "#7FA64C" },
];

function colorFor(key: string) {
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = ((h << 5) + h + key.charCodeAt(i)) | 0;
  return MACARON[Math.abs(h) % MACARON.length];
}

function getUsage(msg: any) {
  if (!msg) return null;
  const cards = msg.cards || msg?.data?.cards;
  if (Array.isArray(cards)) {
    const rc = cards.find(
      (c: any) =>
        c?.code === "AgentScopeRuntimeResponseCard" && c?.data?.usage?.model_name,
    );
    if (rc) return rc.data.usage;
    const any = cards.find((c: any) => c?.data?.usage?.model_name);
    if (any) return any.data.usage;
  }
  if (msg?.data?.usage?.model_name) return msg.data.usage;
  if (msg?.usage?.model_name) return msg.usage;
  return null;
}

(window as any).QwenPaw.chat.actions.add(PLUGIN_ID, {
  id: "model-hint-label",
  render: (ctx: any) => {
    const usage = getUsage(ctx?.data);
    if (!usage?.model_name) return null;
    const label = usage.provider_id
      ? `${usage.provider_id}:${usage.model_name}`
      : usage.model_name;
    const c = colorFor(label);
    if (!React) return null;
    return React.createElement(
      "span",
      {
        title: "Model used for this reply",
        style: {
          marginLeft: 8,
          padding: "2px 12px",
          background: c.bg,
          border: `1px solid ${c.border}`,
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          color: c.text,
          fontFamily: "'Montserrat', sans-serif",
          letterSpacing: "0.2px",
        },
      },
      label,
    );
  },
});
