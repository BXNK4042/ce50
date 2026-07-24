export interface InternStudent {
  id: string;
  name_th: string;
  name_en: string;
  company: string;
  position_th: string;
  position_en: string;
  track: string;
  photo: string;
  period_th: string;
  period_en: string;
  summary_th: string;
  summary_en: string;
  description_th: string;
  description_en: string;
  tech: string[];
  advice_th: string;
  advice_en: string;
  stipend_th: string;
  stipend_en: string;
  welfare_th: string[];
  welfare_en: string[];
  rating: number;
}

export const INTERN_STUDENTS: InternStudent[] = [
  {
    id: "intern-1",
    rating: 5,
    name_th: "นายภาณุวัฒน์ เด่นชัย (CE#49)",
    name_en: "Panuwat Denchai (CE#49)",
    company: "Agoda Services Co., Ltd.",
    position_th: "Software Engineer Intern",
    position_en: "Software Engineer Intern",
    track: "Software & Distributed Systems",
    photo: "/image/internship/student1.jpg",
    period_th: "มิ.ย. - ส.ค. 2025",
    period_en: "June - Aug 2025",
    summary_th: "ร่วมพัฒนา Microservices สำหรับระบบจองโรงแรมสเกลใหญ่ รองรับการประมวลผลข้อมูลนับล้านคำขอต่อวัน",
    summary_en: "Developed high-concurrency microservices for hotel booking engines processing millions of daily requests.",
    description_th: "ได้รับโอกาสทำงานจริงร่วมกับทีม Booking Engine ในการ Optimize SQL queries และพัฒนา gRPC services ด้วย Go และ Scala ช่วยลด latency ของระบบสตรีมข้อมูลผลการค้นหาห้องพักลง 25%",
    description_en: "Worked directly with the Booking Engine team optimizing SQL queries and developing gRPC services in Go and Scala, reducing search results latency by 25%.",
    tech: ["Go", "gRPC", "Scala", "Kubernetes", "PostgreSQL", "Kafka"],
    advice_th: "เตรียมความพร้อมเรื่อง Data Structures, System Design และทักษะภาษาอังกฤษ จะช่วยได้มากในการสัมภาษณ์งาน",
    advice_en: "Strengthen Data Structures, System Design concepts, and English communication skills for technical interviews.",
    stipend_th: "800 - 1,200 บาท / วัน (ประมาณ 20,000 - 26,000 บาท/เดือน)",
    stipend_en: "800 - 1,200 THB / day (approx. 20,000 - 26,000 THB/month)",
    welfare_th: [
      "MacBook Pro M3 Pro สำหรับใช้งานตลอดการฝึกงาน",
      "ฟรีอาหารกลางวัน Buffet & เครื่องดื่มในออฟฟิศ",
      "ประกันสุขภาพกลุ่ม และประกันอุบัติเหตุ",
      "Hybrid Working (เข้าออฟฟิศ 2 วัน/สัปดาห์)",
      "งบสนับสนุนการเรียนออนไลน์ Coursera & Udemy Unlimited"
    ],
    welfare_en: [
      "MacBook Pro M3 Pro laptop provided",
      "Free Daily Buffet Lunch & Drinks",
      "Group Health & Accident Insurance",
      "Hybrid Working (2 Days in office)",
      "Coursera & Udemy Unlimited Skill Budget"
    ]
  },
  {
    id: "intern-2",
    rating: 5,
    name_th: "นางสาวศิริพร บุญเหลือ (CE#49)",
    name_en: "Siriporn Boonlue (CE#49)",
    company: "KBTG",
    position_th: "AI & Data Science Intern",
    position_en: "AI & Data Science Intern",
    track: "Artificial Intelligence & Data",
    photo: "/image/internship/student2.jpg",
    period_th: "มิ.ย. - ส.ค. 2025",
    period_en: "June - Aug 2025",
    summary_th: "พัฒนาแบบจำลอง NLP ตรวจจับข้อความหลอกหลวงและฟิชชิงบนแอปพลิเคชันโมบายแบงก์กิ้ง",
    summary_en: "Built NLP models to detect fraudulent messages and phishing attempts on mobile banking apps.",
    description_th: "สร้างและ Fine-tune โมเดล Thai-BERT ร่วมกับ PyTorch และ FastAPI เพื่อตรวจวิเคราะห์พฤติกรรมเสี่ยงและข้อความน่าสงสัย มีค่า Accuracy สูงถึง 94.8% พร้อมทำ A/B testing บนระบบจริง",
    description_en: "Fine-tuned Thai-BERT NLP models using PyTorch and FastAPI for risk pattern detection with 94.8% accuracy and deployed A/B testing on live telemetry.",
    tech: ["PyTorch", "Python", "BERT", "FastAPI", "Docker", "MLflow"],
    advice_th: "ฝึกฝนการล้างข้อมูล (Data Cleaning) และการตีความผลของโมเดลให้เข้าใจชัดเจน จะทำให้เราทำงานกับทีมงานจริงได้อย่างมั่นใจ",
    advice_en: "Practice data cleaning and model interpretability to collaborate effectively with production data teams.",
    stipend_th: "600 - 900 บาท / วัน (ประมาณ 18,000 - 22,000 บาท/เดือน)",
    stipend_en: "600 - 900 THB / day (approx. 18,000 - 22,000 THB/month)",
    welfare_th: [
      "โน้ตบุ๊กประสิทธิภาพสูงเฉพาะทางด้าน AI Workstation",
      "ประกันอุบัติเหตุกลุ่มพนักงาน",
      "รถตู้รับ-ส่งพนักงานฟรี (สถานี BTS อุดมสุข)",
      "งบอบรมความรู้ทางเทคนิคจาก KBTG Academy"
    ],
    welfare_en: [
      "High-Performance AI Workstation Laptop",
      "Group Accident Insurance Coverage",
      "Free Shuttle Van Service (Udomsuk BTS)",
      "Technical Training Budget by KBTG Academy"
    ]
  },
  {
    id: "intern-3",
    rating: 5,
    name_th: "นายธีรภัทร ชัยมงคล (CE#50)",
    name_en: "Theeraphat Chaimongkol (CE#50)",
    company: "LINE MAN Wongnai",
    position_th: "Backend & Cloud Engineer Intern",
    position_en: "Backend & Cloud Engineer Intern",
    track: "Cloud & Infrastructure",
    photo: "/image/internship/student3.jpg",
    period_th: "มิ.ย. - ส.ค. 2025",
    period_en: "June - Aug 2025",
    summary_th: "ออกแบบและสร้างระบบสตรีมมิ่งข้อมูลคำสั่งซื้ออาหารด้วย Kafka และ Golang สำหรับระบบ Dispatching",
    summary_en: "Architected real-time food delivery order streaming systems using Kafka and Golang for rider dispatching.",
    description_th: "ดูแลการออกแบบ Event-driven architecture ด้วย Apache Kafka และ Redis Cluster รองรับการประมวลผลคำสั่งซื้อช่วง Peak hours ของร้านอาหารกว่า 100,000 ร้านทั่วประเทศ",
    description_en: "Architected event-driven systems using Apache Kafka and Redis Cluster, handling peak hour order throughput across over 100,000 merchant stores nation-wide.",
    tech: ["Golang", "Kafka", "Redis", "Docker", "AWS EKS", "Prometheus"],
    advice_th: "ควรศึกษาเรื่อง Concurrency, Threading และ Containerization ไว้ล่วงหน้า จะต่อยอดงานจริงได้ไวมาก",
    advice_en: "Study concurrency, threading, and containerization fundamentals before starting your internship.",
    stipend_th: "700 - 1,000 บาท / วัน (ประมาณ 20,000 - 24,000 บาท/เดือน)",
    stipend_en: "700 - 1,000 THB / day (approx. 20,000 - 24,000 THB/month)",
    welfare_th: [
      "MacBook M3 Max สำหรับทีมวิศวกร",
      "คูปองโค้ดส่วนลดสั่งอาหาร LINE MAN ฟรีประจำเดือน",
      "Flexible Working Hours (เลือกเวลาทำงานยืดหยุ่น)",
      "Snack Bar & ชากาแฟสดทานฟรีไม่จำกัด"
    ],
    welfare_en: [
      "MacBook M3 Max provided for engineering interns",
      "Monthly LINE MAN Food Voucher Allowances",
      "Flexible Working Hours",
      "Unlimited Fresh Coffee & Snack Bar"
    ]
  }
];

import { api } from "./api";

export async function fetchInternshipStudents(): Promise<InternStudent[]> {
  try {
    const data = await api.internshipStudents();
    if (Array.isArray(data) && data.length > 0) {
      return data as InternStudent[];
    }
  } catch (err) {
    // API server offline or empty, fallback to local dataset
  }
  return INTERN_STUDENTS;
}

export async function fetchInternshipStudentById(id: string): Promise<InternStudent | undefined> {
  try {
    const item = await api.getInternshipStudent(id);
    if (item && item.id) {
      return item as InternStudent;
    }
  } catch (err) {
    // Fallback to local dataset search
  }
  return INTERN_STUDENTS.find((s) => s.id === id);
}
