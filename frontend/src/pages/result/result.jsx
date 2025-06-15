// import React from "react";

//
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   Box,
//   Button,
//   Typography,
//   Container,
//   CssBaseline,
//   Divider,
// } from "@mui/material";
// import { motion } from "framer-motion";

// export default function Result() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { result, urlAnalysis, textAnalysis, originalMessage } =
//     location.state || {};

//   const getStatusColor = (value) => (value ? "#f44336" : "#4caf50");
//   const getStatusText = (value) => (value ? "חשוד" : "תקין");

//   const getSummary = () => {
//     if (urlAnalysis || textAnalysis) {
//       return {
//         text: "🚨 זוהו סימנים מחשידים – ייתכן שזו הונאת פישינג",
//         color: "#f44336",
//       };
//     }
//     return {
//       text: "✅ לא זוהו סימנים מחשידים – ההודעה נראית תקינה",
//       color: "#4caf50",
//     };
//   };

//   const summary = getSummary();

//   return (
//     <Box
//       sx={{
//         width: "100vw",
//         minHeight: "100vh",
//         background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         color: "white",
//         textAlign: "center",
//         px: 2,
//       }}
//     >
//       <Container maxWidth="sm">
//         <CssBaseline />
//         <motion.div
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1 }}
//         >
//           <Box
//             sx={{
//               backgroundColor: "#1e293b",
//               padding: 6,
//               borderRadius: 4,
//               boxShadow: "0px 4px 20px rgba(0, 255, 255, 0.2)",
//             }}
//           >
//             <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
//               תוצאות ניתוח ההודעה
//             </Typography>

//             <Divider sx={{ backgroundColor: "#00e6e6", my: 2 }} />

//             <Typography sx={{ mb: 1, fontWeight: "bold" }}>
//               ניתוח כתובת (URL):
//             </Typography>
//             <Typography sx={{ color: getStatusColor(urlAnalysis), mb: 2 }}>
//               {getStatusText(urlAnalysis)}
//             </Typography>

//             <Typography sx={{ mb: 1, fontWeight: "bold" }}>
//               ניתוח תוכן ההודעה:
//             </Typography>
//             <Typography sx={{ color: getStatusColor(textAnalysis), mb: 2 }}>
//               {getStatusText(textAnalysis)}
//             </Typography>

//             <Typography
//               variant="h6"
//               sx={{ mt: 4, fontWeight: "bold", color: summary.color }}
//             >
//               {summary.text}
//             </Typography>

//             <Button
//               variant="contained"
//               onClick={() => navigate("/analyze")}
//               sx={{
//                 mt: 4,
//                 background: "linear-gradient(90deg, #007bff 0%, #00e6e6 100%)",
//                 "&:hover": { background: "#0056b3" },
//                 fontSize: "16px",
//                 py: 1,
//                 px: 4,
//                 borderRadius: 2,
//                 transition: "transform 0.3s",
//                 "&:hover": { transform: "scale(1.05)" },
//               }}
//             >
//               🔁 נתח הודעה נוספת
//             </Button>
//           </Box>
//         </motion.div>
//       </Container>
//     </Box>
//   );
// }

//

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { textAnalysis, urlAnalysis, matchedWords, originalMessage } =
    location.state || {};

  const isSuspicious = textAnalysis || urlAnalysis;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          תוצאות ניתוח ההודעה
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* ניתוח תוכן ההודעה */}
          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              תוכן ההודעה
            </h3>
            <p className={textAnalysis ? "text-red-600" : "text-green-600"}>
              {textAnalysis ? "חשוד" : "תקין"}
            </p>
            {matchedWords?.length > 0 && (
              <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                {matchedWords.map((word, idx) => (
                  <li key={idx}>{word}</li>
                ))}
              </ul>
            )}
          </div>

          {/* ניתוח כתובת */}
          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              כתובת URL
            </h3>
            <p className={urlAnalysis ? "text-red-600" : "text-green-600"}>
              {urlAnalysis ? "חשוד" : "תקין"}
            </p>
          </div>
        </div>

        {/* סיכום */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
          <p className="text-gray-800 font-medium">
            סיכום:
            <span
              className={
                isSuspicious ? "text-red-600 ml-2" : "text-green-600 ml-2"
              }
            >
              {isSuspicious
                ? "ההודעה מכילה סימנים מחשידים"
                : "ההודעה לא מכילה סימנים מחשידים"}
            </span>
          </p>
        </div>

        {/* כפתור */}
        <div className="text-center">
          <button
            onClick={() => navigate("/analyze")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition"
          >
            נתח הודעה נוספת
          </button>
        </div>
      </div>
    </div>
  );
}
