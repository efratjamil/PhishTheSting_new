import React, { useState } from "react";
import {
  Box,
  Container,
  CssBaseline,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";

export default function History() {
  // 🔹 נתונים זמניים (יוחלפו בנתונים מה-Backend)
  const [history, setHistory] = useState([
    {
      date: "2025-02-01 14:30",
      message: "חשבונך עלול להיחסם, אשר פרטי תשלום כאן: http://fake-link.com",
      result: "🔴 פישינג",
    },
    {
      date: "2025-02-01 10:15",
      message: "ברכות! זכית בהגרלה. לחץ כאן לקבלת הפרס: http://winfree.com",
      result: "🟠 חשוד",
    },
    {
      date: "2025-01-30 18:45",
      message: "שלום, נשלחה לך חבילה מ-DHL. עקוב אחרי המשלוח כאן.",
      result: "🟢 בטוח",
    },
  ]);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Box
            sx={{
              backgroundColor: "#1e293b",
              padding: 6,
              borderRadius: 4,
              boxShadow: "0px 4px 15px rgba(255, 255, 255, 0.1)",
              width: "100%",
              color: "white",
              textAlign: "center",
            }}
          >
            <Typography
              component="h1"
              variant="h5"
              sx={{ mb: 3, fontWeight: "bold" }}
            >
              📜 היסטוריית החיפושים שלך
            </Typography>

            {/* טבלה עם התאריך בצד ימין */}
            <TableContainer
              component={Paper}
              sx={{ backgroundColor: "#2d3748", direction: "rtl" }} // ✅ כיוון מימין לשמאל
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "right",
                      }}
                    >
                      📅 תאריך
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      📝 הודעה
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "left",
                      }}
                    >
                      🔍 תוצאה
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        {item.date}
                      </TableCell>
                      <TableCell sx={{ color: "white", textAlign: "center" }}>
                        {item.message}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "left",
                          color:
                            item.result === "🔴 פישינג"
                              ? "#ff4d4d"
                              : item.result === "🟠 חשוד"
                                ? "#ffcc00"
                                : "#00e676",
                        }}
                      >
                        {item.result}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
