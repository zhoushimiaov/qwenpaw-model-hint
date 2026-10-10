/*
 * model-hint — QwenPaw Web Console frontend plugin
 *
 * Shows the model (provider:model) used for each AI reply as a footer badge.
 *
 * ROOT-CAUSE NOTE: chat.response.append is NOT rendered by this Web Console
 * build (0 render consumers). We use chat.actions.add, which IS rendered in
 * the message footer. Usage lives at:
 *   message.cards.find(c => c.code==="AgentScopeRuntimeResponseCard").data.usage
 *     -> provider_id / model_name
 *
 * Styling: each distinct model string gets a deterministic macaron color, so
 * the same model always shows the same color and a model switch mid-chat is
 * instantly visible.
 */
const React = window.QwenPaw.host && window.QwenPaw.host.React;
const PLUGIN_ID = "model-hint";

// --- Montserrat font (inject once) -----------------------------------------
(function ensureMontserrat() {
  try {
    var id = "model-hint-montserrat";
    if (!document.getElementById(id)) {
      var link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap";
      document.head.appendChild(link);
    }
  } catch (e) {}
})();

// --- Macaron palette (bg / border / text) ----------------------------------
var MACARON = [
  { bg: "#F6E3F5", border: "#E7C6E8", text: "#B06AB8" }, // berry purple
  { bg: "#D7F0E3", border: "#B6E2CC", text: "#4C9A82" }, // mint
  { bg: "#FDF3D0", border: "#F2E3A6", text: "#C9A227" }, // lemon
  { bg: "#D9ECF9", border: "#B9DBF0", text: "#3F8FC4" }, // sky
  { bg: "#FCE4D6", border: "#F6CDB4", text: "#D98659" }, // peach
  { bg: "#FADCE4", border: "#F4C2CF", text: "#D06A86" }, // rose
  { bg: "#E4E0F7", border: "#CDC6EF", text: "#7C6BC4" }, // lavender
  { bg: "#DEF2F0", border: "#BFE4E0", text: "#3F9E95" }, // teal
  { bg: "#F3E8D8", border: "#E4D3BB", text: "#B08754" }, // caramel
  { bg: "#E8F3D6", border: "#D4E7B4", text: "#7FA64C" }, // pistachio
];

// Stable string hash -> palette index (same model => same color)
function colorFor(key) {
  var h = 5381;
  for (var i = 0; i < key.length; i++) {
    h = ((h << 5) + h + key.charCodeAt(i)) | 0;
  }
  var idx = Math.abs(h) % MACARON.length;
  return MACARON[idx];
}

function getUsage(msg) {
  if (!msg) return null;
  var cards = msg.cards || (msg.data && msg.data.cards);
  if (Array.isArray(cards)) {
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (card && card.code === "AgentScopeRuntimeResponseCard" &&
          card.data && card.data.usage && card.data.usage.model_name) {
        return card.data.usage;
      }
    }
    for (var j = 0; j < cards.length; j++) {
      var c2 = cards[j];
      if (c2 && c2.data && c2.data.usage && c2.data.usage.model_name) {
        return c2.data.usage;
      }
    }
  }
  if (msg.data && msg.data.usage && msg.data.usage.model_name) return msg.data.usage;
  if (msg.usage && msg.usage.model_name) return msg.usage;
  return null;
}

window.QwenPaw.chat.actions.add(PLUGIN_ID, {
  id: "model-hint-label",
  render: function (ctx) {
    var usage = getUsage(ctx && ctx.data);
    if (!usage || !usage.model_name) return null;

    var label = usage.provider_id
      ? usage.provider_id + ":" + usage.model_name
      : usage.model_name;

    var c = colorFor(label);
    if (!React) return null;
    return React.createElement(
      "span",
      {
        title: "Model used for this reply",
        style: {
          marginLeft: 8,
          padding: "2px 12px",
          background: c.bg,
          border: "1px solid " + c.border,
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          color: c.text,
          fontFamily: "'Montserrat', sans-serif",
          letterSpacing: "0.2px",
        },
      },
      label
    );
  },
});
