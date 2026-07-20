"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface ExamItem {
  code: string;
  nameEn: string;
  nameTh: string;
  dateRaw: string;
  timeRaw: string;
  startTimeRaw: string;
  endTimeRaw: string;
  midtermEn: string;
  midtermTh: string;
  finalsEn: string;
  finalsTh: string;
}

const DEFAULT_EXAMS: ExamItem[] = [
  {
    code: "CPE 321",
    nameEn: "Database Systems",
    nameTh: "ระบบฐานข้อมูล",
    dateRaw: "2026-10-12",
    timeRaw: "09:00",
    startTimeRaw: "09:00",
    endTimeRaw: "12:00",
    midtermEn: "Oct 12, 2026 (09:00 - 12:00)",
    midtermTh: "12 ต.ค. 2569 (09:00 - 12:00)",
    finalsEn: "Dec 14, 2026 (09:00 - 12:00)",
    finalsTh: "14 ธ.ค. 2569 (09:00 - 12:00)",
  },
  {
    code: "CPE 322",
    nameEn: "Software Engineering",
    nameTh: "วิศวกรรมซอฟต์แวร์",
    dateRaw: "2026-10-13",
    timeRaw: "13:00",
    startTimeRaw: "13:00",
    endTimeRaw: "16:00",
    midtermEn: "Oct 13, 2026 (13:00 - 16:00)",
    midtermTh: "13 ต.ค. 2569 (13:00 - 16:00)",
    finalsEn: "Dec 15, 2026 (13:00 - 16:00)",
    finalsTh: "15 ธ.ค. 2569 (13:00 - 16:00)",
  },
  {
    code: "CPE 323",
    nameEn: "Computer Networks",
    nameTh: "เครือข่ายคอมพิวเตอร์",
    dateRaw: "2026-10-14",
    timeRaw: "09:00",
    startTimeRaw: "09:00",
    endTimeRaw: "12:00",
    midtermEn: "Oct 14, 2026 (09:00 - 12:00)",
    midtermTh: "14 ต.ค. 2569 (09:00 - 12:00)",
    finalsEn: "Dec 16, 2026 (09:00 - 12:00)",
    finalsTh: "16 ธ.ค. 2569 (09:00 - 12:00)",
  },
  {
    code: "CPE 324",
    nameEn: "Embedded Systems",
    nameTh: "ระบบฝังตัว",
    dateRaw: "2026-10-15",
    timeRaw: "13:00",
    startTimeRaw: "13:00",
    endTimeRaw: "16:00",
    midtermEn: "Oct 15, 2026 (13:00 - 16:00)",
    midtermTh: "15 ต.ค. 2569 (13:00 - 16:00)",
    finalsEn: "Dec 17, 2026 (13:00 - 16:00)",
    finalsTh: "17 ธ.ค. 2569 (13:00 - 16:00)",
  },
  {
    code: "CPE 325",
    nameEn: "Artificial Intelligence",
    nameTh: "ปัญญาประดิษฐ์",
    dateRaw: "2026-10-16",
    timeRaw: "09:00",
    startTimeRaw: "09:00",
    endTimeRaw: "12:00",
    midtermEn: "Oct 16, 2026 (09:00 - 12:00)",
    midtermTh: "16 ต.ค. 2569 (09:00 - 12:00)",
    finalsEn: "Dec 18, 2026 (09:00 - 12:00)",
    finalsTh: "18 ธ.ค. 2569 (09:00 - 12:00)",
  },
  {
    code: "CPE 326",
    nameEn: "Operating Systems",
    nameTh: "ระบบปฏิบัติการ",
    dateRaw: "2026-10-19",
    timeRaw: "13:00",
    startTimeRaw: "13:00",
    endTimeRaw: "16:00",
    midtermEn: "Oct 19, 2026 (13:00 - 16:00)",
    midtermTh: "19 ต.ค. 2569 (13:00 - 16:00)",
    finalsEn: "Dec 21, 2026 (13:00 - 16:00)",
    finalsTh: "21 ธ.ค. 2569 (13:00 - 16:00)",
  },
];

interface ClassItem {
  code: string;
  nameEn: string;
  nameTh: string;
  room?: string;
  instructorEn?: string;
  instructorTh?: string;
  descriptionEn?: string;
  descriptionTh?: string;
}

interface WeeklyClassRow {
  time: string;
  monday: ClassItem | null;
  tuesday: ClassItem | null;
  wednesday: ClassItem | null;
  thursday: ClassItem | null;
  friday: ClassItem | null;
  saturday: ClassItem | null;
}

const DEFAULT_CLASSES: WeeklyClassRow[] = [
  {
    time: "09:00 - 10:00",
    monday: {
      code: "CPE 321",
      nameEn: "Database Systems",
      nameTh: "ระบบฐานข้อมูล",
      room: "CPE-401",
      instructorEn: "Dr. Sarah Johnson",
      instructorTh: "ดร. ซาร่าห์ จอห์นสัน",
      descriptionEn: "Introduction to database management systems. Topics include relational database design, query languages (SQL), database storage and indexing, transaction management, concurrency control, and database administration.",
      descriptionTh: "สถาปัตยกรรมระบบจัดการฐานข้อมูล แบบจำลองข้อมูลความสัมพันธ์ ภาษาคิวรีมาตรฐาน (SQL) การออกแบบฐานข้อมูลเชิงสัมพันธ์ด้วยขั้นตอนวิธีนอร์มัลไลเซชัน การควบคุมภาวะพร้อมกัน การกู้คืนระบบ และการจัดการความปลอดภัย"
    },
    tuesday: {
      code: "CPE 322",
      nameEn: "Software Engineering",
      nameTh: "วิศวกรรมซอฟต์แวร์",
      room: "CPE-402",
      instructorEn: "Dr. Michael Chen",
      instructorTh: "ดร. ไมเคิล เฉิน",
      descriptionEn: "Principles of software engineering. Topics include software development lifecycles, requirement analysis, software design patterns, architectural styles, software testing, agile methodologies, and project management.",
      descriptionTh: "หลักการวิศวกรรมซอฟต์แวร์ วงจรการพัฒนาซอฟต์แวร์ การวิเคราะห์ความต้องการ การออกแบบระบบสถาปัตยกรรมซอฟต์แวร์ รูปแบบการทดสอบซอฟต์แวร์ กระบวนการพัฒนาแบบเอจายล์ และการจัดการโครงการซอฟต์แวร์"
    },
    wednesday: {
      code: "CPE 323",
      nameEn: "Computer Networks",
      nameTh: "เครือข่ายคอมพิวเตอร์",
      room: "CPE-501",
      instructorEn: "Dr. Alan Turing",
      instructorTh: "ดร. อลัน ทัวริง",
      descriptionEn: "Fundamentals of computer networks and communications. Topics include OSI model, TCP/IP protocol suite, network routing algorithms, transport layer congestion control, DNS, HTTP, and network security concepts.",
      descriptionTh: "สถาปัตยกรรมโครงข่ายเครือข่ายคอมพิวเตอร์ตามแบบจำลอง OSI และ TCP/IP อัลกอริทึมการกำหนดเส้นทาง การควบคุมความคับคั่งในระดับชั้นขนส่ง โปรโตคอลแอปพลิเคชัน และความปลอดภัยบนระบบเครือข่าย"
    },
    thursday: {
      code: "CPE 324",
      nameEn: "Embedded Systems",
      nameTh: "ระบบฝังตัว",
      room: "CPE-502",
      instructorEn: "Dr. Grace Hopper",
      instructorTh: "ดร. เกรซ ฮอปเปอร์",
      descriptionEn: "Introduction to embedded systems design. Topics include microcontroller architecture, hardware-software co-design, real-time operating systems (RTOS), serial communication interfaces (I2C, SPI, UART), and sensor interfacing.",
      descriptionTh: "การออกแบบระบบคอมพิวเตอร์ฝังตัว สถาปัตยกรรมไมโครคอนโทรลเลอร์ การควบคุมอุปกรณ์รับเข้าและส่งออก อินเทอร์เฟสระบบสื่อสารอนุกรม ระบบปฏิบัติการเวลาจริง (RTOS) และการเชื่อมต่อเซนเซอร์"
    },
    friday: {
      code: "CPE 325",
      nameEn: "Artificial Intelligence",
      nameTh: "ปัญญาประดิษฐ์",
      room: "CPE-601",
      instructorEn: "Dr. John McCarthy",
      instructorTh: "ดร. จอห์น แมคคาร์ธี",
      descriptionEn: "Principles of artificial intelligence. Topics include heuristic search techniques, knowledge representation, logic programming, machine learning algorithms, artificial neural networks, and decision theory.",
      descriptionTh: "แนวคิดพื้นฐานเกี่ยวกับปัญญาประดิษฐ์ เทคนิคการค้นหาเชิงศึกษาพยากรณ์ การแสดงความรู้ การให้เหตุผลเชิงตรรกะ ตัวแทนที่ชาญฉลาด และการประยุกต์ใช้งานขั้นตอนวิธีเรียนรู้ของเครื่อง"
    },
    saturday: null,
  },
  {
    time: "10:00 - 11:00",
    monday: {
      code: "CPE 321",
      nameEn: "Database Systems",
      nameTh: "ระบบฐานข้อมูล",
      room: "CPE-401",
      instructorEn: "Dr. Sarah Johnson",
      instructorTh: "ดร. ซาร่าห์ จอห์นสัน",
      descriptionEn: "Introduction to database management systems. Topics include relational database design, query languages (SQL), database storage and indexing, transaction management, concurrency control, and database administration.",
      descriptionTh: "สถาปัตยกรรมระบบจัดการฐานข้อมูล แบบจำลองข้อมูลความสัมพันธ์ ภาษาคิวรีมาตรฐาน (SQL) การออกแบบฐานข้อมูลเชิงสัมพันธ์ด้วยขั้นตอนวิธีนอร์มัลไลเซชัน การควบคุมภาวะพร้อมกัน การกู้คืนระบบ และการจัดการความปลอดภัย"
    },
    tuesday: {
      code: "CPE 322",
      nameEn: "Software Engineering",
      nameTh: "วิศวกรรมซอฟต์แวร์",
      room: "CPE-402",
      instructorEn: "Dr. Michael Chen",
      instructorTh: "ดร. ไมเคิล เฉิน",
      descriptionEn: "Principles of software engineering. Topics include software development lifecycles, requirement analysis, software design patterns, architectural styles, software testing, agile methodologies, and project management.",
      descriptionTh: "หลักการวิศวกรรมซอฟต์แวร์ วงจรการพัฒนาซอฟต์แวร์ การวิเคราะห์ความต้องการ การออกแบบระบบสถาปัตยกรรมซอฟต์แวร์ รูปแบบการทดสอบซอฟต์แวร์ กระบวนการพัฒนาแบบเอจายล์ และการจัดการโครงการซอฟต์แวร์"
    },
    wednesday: {
      code: "CPE 323",
      nameEn: "Computer Networks",
      nameTh: "เครือข่ายคอมพิวเตอร์",
      room: "CPE-501",
      instructorEn: "Dr. Alan Turing",
      instructorTh: "ดร. อลัน ทัวริง",
      descriptionEn: "Fundamentals of computer networks and communications. Topics include OSI model, TCP/IP protocol suite, network routing algorithms, transport layer congestion control, DNS, HTTP, and network security concepts.",
      descriptionTh: "สถาปัตยกรรมโครงข่ายเครือข่ายคอมพิวเตอร์ตามแบบจำลอง OSI และ TCP/IP อัลกอริทึมการกำหนดเส้นทาง การควบคุมความคับคั่งในระดับชั้นขนส่ง โปรโตคอลแอปพลิเคชัน และความปลอดภัยบนระบบเครือข่าย"
    },
    thursday: {
      code: "CPE 324",
      nameEn: "Embedded Systems",
      nameTh: "ระบบฝังตัว",
      room: "CPE-502",
      instructorEn: "Dr. Grace Hopper",
      instructorTh: "ดร. เกรซ ฮอปเปอร์",
      descriptionEn: "Introduction to embedded systems design. Topics include microcontroller architecture, hardware-software co-design, real-time operating systems (RTOS), serial communication interfaces (I2C, SPI, UART), and sensor interfacing.",
      descriptionTh: "การออกแบบระบบคอมพิวเตอร์ฝังตัว สถาปัตยกรรมไมโครคอนโทรลเลอร์ การควบคุมอุปกรณ์รับเข้าและส่งออก อินเทอร์เฟสระบบสื่อสารอนุกรม ระบบปฏิบัติการเวลาจริง (RTOS) และการเชื่อมต่อเซนเซอร์"
    },
    friday: {
      code: "CPE 325",
      nameEn: "Artificial Intelligence",
      nameTh: "ปัญญาประดิษฐ์",
      room: "CPE-601",
      instructorEn: "Dr. John McCarthy",
      instructorTh: "ดร. จอห์น แมคคาร์ธี",
      descriptionEn: "Principles of artificial intelligence. Topics include heuristic search techniques, knowledge representation, logic programming, machine learning algorithms, artificial neural networks, and decision theory.",
      descriptionTh: "แนวคิดพื้นฐานเกี่ยวกับปัญญาประดิษฐ์ เทคนิคการค้นหาเชิงศึกษาพยากรณ์ การแสดงความรู้ การให้เหตุผลเชิงตรรกะ ตัวแทนที่ชาญฉลาด และการประยุกต์ใช้งานขั้นตอนวิธีเรียนรู้ของเครื่อง"
    },
    saturday: null,
  },
  {
    time: "11:00 - 12:00",
    monday: {
      code: "CPE 321",
      nameEn: "Database Systems",
      nameTh: "ระบบฐานข้อมูล",
      room: "CPE-401",
      instructorEn: "Dr. Sarah Johnson",
      instructorTh: "ดร. ซาร่าห์ จอห์นสัน",
      descriptionEn: "Introduction to database management systems. Topics include relational database design, query languages (SQL), database storage and indexing, transaction management, concurrency control, and database administration.",
      descriptionTh: "สถาปัตยกรรมระบบจัดการฐานข้อมูล แบบจำลองข้อมูลความสัมพันธ์ ภาษาคิวรีมาตรฐาน (SQL) การออกแบบฐานข้อมูลเชิงสัมพันธ์ด้วยขั้นตอนวิธีนอร์มัลไลเซชัน การควบคุมภาวะพร้อมกัน การกู้คืนระบบ และการจัดการความปลอดภัย"
    },
    tuesday: {
      code: "CPE 322",
      nameEn: "Software Engineering",
      nameTh: "วิศวกรรมซอฟต์แวร์",
      room: "CPE-402",
      instructorEn: "Dr. Michael Chen",
      instructorTh: "ดร. ไมเคิล เฉิน",
      descriptionEn: "Principles of software engineering. Topics include software development lifecycles, requirement analysis, software design patterns, architectural styles, software testing, agile methodologies, and project management.",
      descriptionTh: "หลักการวิศวกรรมซอฟต์แวร์ วงจรการพัฒนาซอฟต์แวร์ การวิเคราะห์ความต้องการ การออกแบบระบบสถาปัตยกรรมซอฟต์แวร์ รูปแบบการทดสอบซอฟต์แวร์ กระบวนการพัฒนาแบบเอจายล์ และการจัดการโครงการซอฟต์แวร์"
    },
    wednesday: {
      code: "CPE 323",
      nameEn: "Computer Networks",
      nameTh: "เครือข่ายคอมพิวเตอร์",
      room: "CPE-501",
      instructorEn: "Dr. Alan Turing",
      instructorTh: "ดร. อลัน ทัวริง",
      descriptionEn: "Fundamentals of computer networks and communications. Topics include OSI model, TCP/IP protocol suite, network routing algorithms, transport layer congestion control, DNS, HTTP, and network security concepts.",
      descriptionTh: "สถาปัตยกรรมโครงข่ายเครือข่ายคอมพิวเตอร์ตามแบบจำลอง OSI และ TCP/IP อัลกอริทึมการกำหนดเส้นทาง การควบคุมความคับคั่งในระดับชั้นขนส่ง โปรโตคอลแอปพลิเคชัน และความปลอดภัยบนระบบเครือข่าย"
    },
    thursday: {
      code: "CPE 324",
      nameEn: "Embedded Systems",
      nameTh: "ระบบฝังตัว",
      room: "CPE-502",
      instructorEn: "Dr. Grace Hopper",
      instructorTh: "ดร. เกรซ ฮอปเปอร์",
      descriptionEn: "Introduction to embedded systems design. Topics include microcontroller architecture, hardware-software co-design, real-time operating systems (RTOS), serial communication interfaces (I2C, SPI, UART), and sensor interfacing.",
      descriptionTh: "การออกแบบระบบคอมพิวเตอร์ฝังตัว สถาปัตยกรรมไมโครคอนโทรลเลอร์ การควบคุมอุปกรณ์รับเข้าและส่งออก อินเทอร์เฟสระบบสื่อสารอนุกรม ระบบปฏิบัติการเวลาจริง (RTOS) และการเชื่อมต่อเซนเซอร์"
    },
    friday: {
      code: "CPE 325",
      nameEn: "Artificial Intelligence",
      nameTh: "ปัญญาประดิษฐ์",
      room: "CPE-601",
      instructorEn: "Dr. John McCarthy",
      instructorTh: "ดร. จอห์น แมคคาร์ธี",
      descriptionEn: "Principles of artificial intelligence. Topics include heuristic search techniques, knowledge representation, logic programming, machine learning algorithms, artificial neural networks, and decision theory.",
      descriptionTh: "แนวคิดพื้นฐานเกี่ยวกับปัญญาประดิษฐ์ เทคนิคการค้นหาเชิงศึกษาพยากรณ์ การแสดงความรู้ การให้เหตุผลเชิงตรรกะ ตัวแทนที่ชาญฉลาด และการประยุกต์ใช้งานขั้นตอนวิธีเรียนรู้ของเครื่อง"
    },
    saturday: null,
  },
  {
    time: "12:00 - 13:00",
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
  },
  {
    time: "13:00 - 14:00",
    monday: {
      code: "CPE 326",
      nameEn: "Operating Systems",
      nameTh: "ระบบปฏิบัติการ",
      room: "CPE-401",
      instructorEn: "Dr. Sarah Johnson",
      instructorTh: "ดร. ซาร่าห์ จอห์นสัน",
      descriptionEn: "Principles of operating systems architecture. Topics include process synchronization, CPU scheduling, thread management, memory management, virtual memory techniques, file systems, disk scheduling, and deadlocks.",
      descriptionTh: "โครงสร้างและหน้าที่ของระบบปฏิบัติการ การจัดการกระบวนการ การจัดตารางเวลาของซีพียู การจัดการหน่วยความจำหลัก หน่วยความจำเสมือน ระบบแฟ้มข้อมูล และการจัดการทรัพยากรเมื่อเกิดการติดตาย"
    },
    tuesday: null,
    wednesday: {
      code: "CPE 381",
      nameEn: "Comp Eng Lab III",
      nameTh: "ปฏิบัติการวิศวกรรมคอมพิวเตอร์ 3",
      room: "CPE-Lab 3",
      instructorEn: "Dr. Linus Torvalds",
      instructorTh: "ดร. ไลนัส ทอร์วัลด์ส",
      descriptionEn: "Practical experiments in computer engineering. Focuses on advanced web services development, network socket programming, API integration, and hands-on system administration in Linux servers.",
      descriptionTh: "การทดลองเชิงปฏิบัติการวิศวกรรมคอมพิวเตอร์ มุ่งเน้นการสร้างเว็บเซอร์วิสขั้นสูง โปรแกรมมิ่งซ็อกเก็ตเครือข่าย การผสานอินเทอร์เฟส API และทักษะการดูแลระบบเซิร์ฟเวอร์ด้วย Linux"
    },
    thursday: null,
    friday: null,
    saturday: null,
  },
  {
    time: "14:00 - 15:00",
    monday: {
      code: "CPE 326",
      nameEn: "Operating Systems",
      nameTh: "ระบบปฏิบัติการ",
      room: "CPE-401",
      instructorEn: "Dr. Sarah Johnson",
      instructorTh: "ดร. ซาร่าห์ จอห์นสัน",
      descriptionEn: "Principles of operating systems architecture. Topics include process synchronization, CPU scheduling, thread management, memory management, virtual memory techniques, file systems, disk scheduling, and deadlocks.",
      descriptionTh: "โครงสร้างและหน้าที่ของระบบปฏิบัติการ การจัดการกระบวนการ การจัดตารางเวลาของซีพียู การจัดการหน่วยความจำหลัก หน่วยความจำเสมือน ระบบแฟ้มข้อมูล และการจัดการทรัพยากรเมื่อเกิดการติดตาย"
    },
    tuesday: null,
    wednesday: {
      code: "CPE 381",
      nameEn: "Comp Eng Lab III",
      nameTh: "ปฏิบัติการวิศวกรรมคอมพิวเตอร์ 3",
      room: "CPE-Lab 3",
      instructorEn: "Dr. Linus Torvalds",
      instructorTh: "ดร. ไลนัส ทอร์วัลด์ส",
      descriptionEn: "Practical experiments in computer engineering. Focuses on advanced web services development, network socket programming, API integration, and hands-on system administration in Linux servers.",
      descriptionTh: "การทดลองเชิงปฏิบัติการวิศวกรรมคอมพิวเตอร์ มุ่งเน้นการสร้างเว็บเซอร์วิสขั้นสูง โปรแกรมมิ่งซ็อกเก็ตเครือข่าย การผสานอินเทอร์เฟส API และทักษะการดูแลระบบเซิร์ฟเวอร์ด้วย Linux"
    },
    thursday: null,
    friday: null,
    saturday: null,
  },
  {
    time: "15:00 - 16:00",
    monday: {
      code: "CPE 326",
      nameEn: "Operating Systems",
      nameTh: "ระบบปฏิบัติการ",
      room: "CPE-401",
      instructorEn: "Dr. Sarah Johnson",
      instructorTh: "ดร. ซาร่าห์ จอห์นสัน",
      descriptionEn: "Principles of operating systems architecture. Topics include process synchronization, CPU scheduling, thread management, memory management, virtual memory techniques, file systems, disk scheduling, and deadlocks.",
      descriptionTh: "โครงสร้างและหน้าที่ of ระบบปฏิบัติการ การจัดการกระบวนการ การจัดตารางเวลาของซีพียู การจัดการหน่วยความจำหลัก หน่วยความจำเสมือน ระบบแฟ้มข้อมูล และการจัดการทรัพยากรเมื่อเกิดการติดตาย"
    },
    tuesday: null,
    wednesday: {
      code: "CPE 381",
      nameEn: "Comp Eng Lab III",
      nameTh: "ปฏิบัติการวิศวกรรมคอมพิวเตอร์ 3",
      room: "CPE-Lab 3",
      instructorEn: "Dr. Linus Torvalds",
      instructorTh: "ดร. ไลนัส ทอร์วัลด์ส",
      descriptionEn: "Practical experiments in computer engineering. Focuses on advanced web services development, network socket programming, API integration, and hands-on system administration in Linux servers.",
      descriptionTh: "การทดลองเชิงปฏิบัติการวิศวกรรมคอมพิวเตอร์ มุ่งเน้นการสร้างเว็บเซอร์วิสขั้นสูง โปรแกรมมิ่งซ็อกเก็ตเครือข่าย การผสานอินเทอร์เฟส API และทักษะการดูแลระบบเซิร์ฟเวอร์ด้วย Linux"
    },
    thursday: null,
    friday: null,
    saturday: null,
  },
  {
    time: "16:00 - 17:00",
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
  },
  {
    time: "17:00 - 18:00",
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
  },
  {
    time: "18:00 - 19:00",
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
  },
  {
    time: "19:00 - 20:00",
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
  },
];

export default function ScheduleClient({
  lang,
  dict,
  type,
  term,
}: {
  lang: string;
  dict: any;
  type?: string;
  term?: string;
}) {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [weeklyClasses, setWeeklyClasses] = useState<WeeklyClassRow[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  useEffect(() => {
    api.schedule("exam", 2026)
      .then((data) => {
        if (data && data.length > 0 && data[0].payload) {
          setExams(data[0].payload as ExamItem[]);
        } else {
          setExams(DEFAULT_EXAMS);
        }
      })
      .catch((err) => {
        console.error("Failed to load exams from DB, fallback to default", err);
        setExams(DEFAULT_EXAMS);
      });

    api.schedule("class", 2026)
      .then((data) => {
        if (data && data.length > 0 && data[0].payload) {
          setWeeklyClasses(data[0].payload as WeeklyClassRow[]);
        } else {
          setWeeklyClasses(DEFAULT_CLASSES);
        }
      })
      .catch((err) => {
        console.error("Failed to load classes from DB, fallback to default", err);
        setWeeklyClasses(DEFAULT_CLASSES);
      });
  }, []);

  // --- PRE-COMPUTE ROW SPANS FOR CONTIGUOUS IDENTICAL SUBJECTS ---
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
  
  // Matrix representing span states for each row index
  const spans = weeklyClasses.map(() =>
    days.reduce((acc, day) => {
      acc[day] = { rowSpan: 1, shouldRender: true };
      return acc;
    }, {} as Record<typeof days[number], { rowSpan: number; shouldRender: boolean }>)
  );

  // Compute values
  days.forEach((day) => {
    for (let r = 0; r < weeklyClasses.length; r++) {
      if (weeklyClasses[r].time === "12:00 - 13:00") {
        spans[r][day].shouldRender = false;
        continue;
      }
      if (!spans[r][day].shouldRender) {
        continue;
      }
      
      const currentItem = weeklyClasses[r][day];
      if (currentItem) {
        let nextR = r + 1;
        while (nextR < weeklyClasses.length) {
          if (weeklyClasses[nextR].time === "12:00 - 13:00") {
            break;
          }
          const nextItem = weeklyClasses[nextR][day];
          if (nextItem && nextItem.code === currentItem.code) {
            spans[r][day].rowSpan += 1;
            spans[nextR][day].shouldRender = false;
            nextR++;
          } else {
            break;
          }
        }
        r = nextR - 1;
      }
    }
  });

  const [countdownText, setCountdownText] = useState<string>("");

  useEffect(() => {
    if (exams.length === 0) return;

    const updateCountdown = () => {
      const now = new Date();
      const upcoming = exams
        .filter(exam => exam.dateRaw && exam.dateRaw !== "9999-12-31")
        .map(exam => {
          const dateTime = new Date(`${exam.dateRaw}T${exam.startTimeRaw || "00:00"}:00`);
          return { ...exam, dateTime };
        })
        .filter(exam => exam.dateTime.getTime() > now.getTime())
        .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

      if (upcoming.length === 0) {
        setCountdownText(lang === "th" ? "ไม่มีการสอบที่กำลังจะมาถึง" : "No upcoming exams");
        return;
      }

      const nextExam = upcoming[0];
      const diff = nextExam.dateTime.getTime() - now.getTime();
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (lang === "th") {
        setCountdownText(
          `สอบถัดไป: ${nextExam.code} ใน ${days} วัน ${hours} ชม. ${minutes} น. ${seconds} วิ`
        );
      } else {
        setCountdownText(
          `Next: ${nextExam.code} in ${days}d ${hours}h ${minutes}m ${seconds}s`
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [exams, lang]);

  const displayTitle = dict.schedule.title;
  const activeTab = type === "exam" ? "exam" : "class";
  const currentTerm = term || "all";
  const activeIndex = currentTerm === "finals" ? 2 : currentTerm === "midterm" ? 1 : 0;

  return (
    <section className="w-full px-12 md:px-16 py-8 md:py-12 min-h-[calc(100vh-16rem)] flex gap-12">
      {/* Left Sidebar */}
      <div className="flex flex-col w-56 shrink-0">
        <h1 className="text-2xl font-semibold">{displayTitle}</h1>
        <p className="mt-2 text-zinc-500">{dict.schedule.subtitle}</p>
        <p className="mt-1 text-yellow-600 dark:text-yellow-400">COMPUTER ENGINEER</p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/${lang}/schedule?type=exam`}
            className={`relative px-4 py-3 text-sm font-semibold transition-all border rounded-md overflow-hidden ${
              activeTab === "exam"
                ? "bg-blue-50/50 dark:bg-sky-950/10 text-blue-600 dark:text-sky-400 border-blue-200 dark:border-sky-900/50"
                : "bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            {activeTab === "exam" && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-sky-500" />
            )}
            <span className={activeTab === "exam" ? "pl-1.5" : ""}>
              {dict.schedule.upcomingExams}
            </span>
          </Link>
          <Link
            href={`/${lang}/schedule?type=class`}
            className={`relative px-4 py-3 text-sm font-semibold transition-all border rounded-md overflow-hidden ${
              activeTab === "class"
                ? "bg-blue-50/50 dark:bg-sky-950/10 text-blue-600 dark:text-sky-400 border-blue-200 dark:border-sky-900/50"
                : "bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            {activeTab === "class" && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-sky-500" />
            )}
            <span className={activeTab === "class" ? "pl-1.5" : ""}>
              {dict.schedule.weeklyOverview}
            </span>
          </Link>
        </div>
      </div>

      {/* Pulsing Vertical Line */}
      <div className="w-px bg-blue-600 dark:bg-sky-500 animate-pulse self-stretch my-2" />

      {/* Right Content Area */}
      <div className="flex-1">
        {type === "exam" ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3 text-zinc-900 dark:text-zinc-100 leading-none">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-sky-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{lang === "th" ? "ตารางสอบ" : "Exam Schedule"}</span>
              </h2>
              
              <div className="flex items-center gap-3 self-end md:self-auto">
                {countdownText && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50/50 dark:bg-sky-950/20 border border-blue-100 dark:border-sky-900/30 text-blue-600 dark:text-sky-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-500 animate-ping" />
                    <span>{countdownText}</span>
                  </div>
                )}
                <Link
                  href={`/${lang}/admin/schedule`}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all duration-300"
                  title={lang === "th" ? "ตั้งค่าตารางสอบ" : "Exam Schedule Settings"}
                >
                  <svg
                    className="w-6 h-6 transform hover:rotate-45 transition-transform duration-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Segmented Control Switcher */}
            <div className="relative flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900 p-1 w-[380px] h-11 mt-6">
              <div
                className="absolute top-1 bottom-1 left-1 w-[calc(33.3333%-3px)] bg-white dark:bg-zinc-800 rounded-md shadow-sm transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(${activeIndex * 100}%) translateX(${activeIndex * 1}px)`,
                }}
              />
              
              <Link
                href={`/${lang}/schedule?type=exam&term=all`}
                className={`relative z-10 flex-1 text-center text-xs md:text-sm font-semibold py-2 transition-colors duration-300 ${
                  activeIndex === 0
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {dict.schedule.allTerms}
              </Link>
              <Link
                href={`/${lang}/schedule?type=exam&term=midterm`}
                className={`relative z-10 flex-1 text-center text-xs md:text-sm font-semibold py-2 transition-colors duration-300 ${
                  activeIndex === 1
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {dict.schedule.midterm}
              </Link>
              <Link
                href={`/${lang}/schedule?type=exam&term=finals`}
                className={`relative z-10 flex-1 text-center text-xs md:text-sm font-semibold py-2 transition-colors duration-300 ${
                  activeIndex === 2
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {dict.schedule.finals}
              </Link>
            </div>

            {/* Exams Table */}
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-50/70 dark:bg-sky-950/20 border-b border-blue-100 dark:border-sky-900/30">
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300">SUBJECT</th>
                    {(currentTerm === "all" || currentTerm === "midterm") && (
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300">MIDTERM</th>
                    )}
                    {(currentTerm === "all" || currentTerm === "finals") && (
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300">FINALS</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr
                      key={exam.code}
                      className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">{exam.code}</div>
                          <Link
                            href={`/${lang}/admin/schedule?edit=${exam.code}`}
                            className="p-1 text-zinc-400 hover:text-blue-600 dark:hover:text-sky-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                            title={lang === "th" ? "แก้ไขวิชานี้" : "Edit this subject"}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </Link>
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">{lang === "th" ? exam.nameTh : exam.nameEn}</div>
                      </td>
                      {(currentTerm === "all" || currentTerm === "midterm") && (
                        <td className="py-4 px-4 text-sm text-zinc-700 dark:text-zinc-300">
                          {lang === "th" ? exam.midtermTh : exam.midtermEn}
                        </td>
                      )}
                      {(currentTerm === "all" || currentTerm === "finals") && (
                        <td className="py-4 px-4 text-sm text-zinc-700 dark:text-zinc-300">
                          {lang === "th" ? exam.finalsTh : exam.finalsEn}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between w-full">
              <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3 text-zinc-900 dark:text-zinc-100 leading-none">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-sky-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{lang === "th" ? "ตารางเรียน" : "Weekly Timetable"}</span>
              </h2>

              <Link
                href={`/${lang}/admin/class-schedule`}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all duration-300"
                title={lang === "th" ? "ตั้งค่าตารางเรียน" : "Weekly Timetable Settings"}
              >
                <svg
                  className="w-6 h-6 transform hover:rotate-45 transition-transform duration-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
            </div>

            {/* Weekly Timetable Table */}
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px] border border-zinc-300 dark:border-zinc-700">
                <thead>
                  <tr className="bg-blue-50/70 dark:bg-sky-950/20 border-b-2 border-zinc-300 dark:border-zinc-700">
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300 border border-zinc-300 dark:border-zinc-700">TIME</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300 border border-zinc-300 dark:border-zinc-700">MONDAY</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300 border border-zinc-300 dark:border-zinc-700">TUESDAY</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300 border border-zinc-300 dark:border-zinc-700">WEDNESDAY</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300 border border-zinc-300 dark:border-zinc-700">THURSDAY</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300 border border-zinc-300 dark:border-zinc-700">FRIDAY</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300 border border-zinc-300 dark:border-zinc-700">SATURDAY</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyClasses.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap border border-zinc-300 dark:border-zinc-700">
                        {row.time}
                      </td>
                      {row.time === "12:00 - 13:00" ? (
                        <td
                          colSpan={6}
                          className="py-4 px-4 text-center text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest bg-zinc-50/40 dark:bg-zinc-900/20 border border-zinc-300 dark:border-zinc-700"
                        >
                          {lang === "th" ? "พักกลางวัน (LUNCH BREAK)" : "LUNCH BREAK"}
                        </td>
                      ) : (
                        <>
                          {/* Monday */}
                          {spans[index].monday.shouldRender && (
                            <td
                              rowSpan={spans[index].monday.rowSpan}
                              onClick={() => row.monday && setSelectedClass(row.monday)}
                              className={row.monday ? "py-4 px-4 text-sm bg-blue-50/70 dark:bg-sky-950/30 border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:scale-[1.01] hover:shadow-sm transform transition-all duration-200" : "py-4 px-4 text-sm text-center text-zinc-400 dark:text-zinc-600 border border-zinc-300 dark:border-zinc-700"}
                            >
                              {row.monday ? (
                                <>
                                  <div className="font-bold text-blue-900 dark:text-sky-200">{row.monday.code}</div>
                                  <div className="text-xs text-blue-700/80 dark:text-sky-300/80 mt-0.5 font-medium">{lang === "th" ? row.monday.nameTh : row.monday.nameEn}</div>
                                  <div className="flex flex-col gap-0.5 mt-1.5 pt-1.5 border-t border-blue-100/30 dark:border-sky-900/10 text-[10px] text-blue-600/70 dark:text-sky-400/70 text-left">
                                    {row.monday.room && (
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-blue-500/60 dark:text-sky-500/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span>{lang === "th" ? `ห้อง: ${row.monday.room}` : `Room: ${row.monday.room}`}</span>
                                      </div>
                                    )}
                                    {(row.monday.instructorEn || row.monday.instructorTh) && (
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-blue-500/60 dark:text-sky-500/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="truncate">{lang === "th" ? row.monday.instructorTh : row.monday.instructorEn}</span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                "-"
                              )}
                            </td>
                          )}
                          {/* Tuesday */}
                          {spans[index].tuesday.shouldRender && (
                            <td
                              rowSpan={spans[index].tuesday.rowSpan}
                              onClick={() => row.tuesday && setSelectedClass(row.tuesday)}
                              className={row.tuesday ? "py-4 px-4 text-sm bg-blue-50/70 dark:bg-sky-950/30 border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:scale-[1.01] hover:shadow-sm transform transition-all duration-200" : "py-4 px-4 text-sm text-center text-zinc-400 dark:text-zinc-600 border border-zinc-300 dark:border-zinc-700"}
                            >
                              {row.tuesday ? (
                                <>
                                  <div className="font-bold text-blue-900 dark:text-sky-200">{row.tuesday.code}</div>
                                  <div className="text-xs text-blue-700/80 dark:text-sky-300/80 mt-0.5 font-medium">{lang === "th" ? row.tuesday.nameTh : row.tuesday.nameEn}</div>
                                  <div className="flex flex-col gap-0.5 mt-1.5 pt-1.5 border-t border-blue-100/30 dark:border-sky-900/10 text-[10px] text-blue-600/70 dark:text-sky-400/70 text-left">
                                    {row.tuesday.room && (
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-blue-500/60 dark:text-sky-500/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span>{lang === "th" ? `ห้อง: ${row.tuesday.room}` : `Room: ${row.tuesday.room}`}</span>
                                      </div>
                                    )}
                                    {(row.tuesday.instructorEn || row.tuesday.instructorTh) && (
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-blue-500/60 dark:text-sky-500/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="truncate">{lang === "th" ? row.tuesday.instructorTh : row.tuesday.instructorEn}</span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                "-"
                              )}
                            </td>
                          )}
                          {/* Wednesday */}
                          {spans[index].wednesday.shouldRender && (
                            <td
                              rowSpan={spans[index].wednesday.rowSpan}
                              onClick={() => row.wednesday && setSelectedClass(row.wednesday)}
                              className={row.wednesday ? "py-4 px-4 text-sm bg-blue-50/70 dark:bg-sky-950/30 border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:scale-[1.01] hover:shadow-sm transform transition-all duration-200" : "py-4 px-4 text-sm text-center text-zinc-400 dark:text-zinc-600 border border-zinc-300 dark:border-zinc-700"}
                            >
                              {row.wednesday ? (
                                <>
                                  <div className="font-bold text-blue-900 dark:text-sky-200">{row.wednesday.code}</div>
                                  <div className="text-xs text-blue-700/80 dark:text-sky-300/80 mt-0.5 font-medium">{lang === "th" ? row.wednesday.nameTh : row.wednesday.nameEn}</div>
                                  <div className="flex flex-col gap-0.5 mt-1.5 pt-1.5 border-t border-blue-100/30 dark:border-sky-900/10 text-[10px] text-blue-600/70 dark:text-sky-400/70 text-left">
                                    {row.wednesday.room && (
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-blue-500/60 dark:text-sky-500/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span>{lang === "th" ? `ห้อง: ${row.wednesday.room}` : `Room: ${row.wednesday.room}`}</span>
                                      </div>
                                    )}
                                    {(row.wednesday.instructorEn || row.wednesday.instructorTh) && (
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-blue-500/60 dark:text-sky-500/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="truncate">{lang === "th" ? row.wednesday.instructorTh : row.wednesday.instructorEn}</span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                "-"
                              )}
                            </td>
                          )}
                          {/* Thursday */}
                          {spans[index].thursday.shouldRender && (
                            <td
                              rowSpan={spans[index].thursday.rowSpan}
                              onClick={() => row.thursday && setSelectedClass(row.thursday)}
                              className={row.thursday ? "py-4 px-4 text-sm bg-blue-50/70 dark:bg-sky-950/30 border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:scale-[1.01] hover:shadow-sm transform transition-all duration-200" : "py-4 px-4 text-sm text-center text-zinc-400 dark:text-zinc-600 border border-zinc-300 dark:border-zinc-700"}
                            >
                              {row.thursday ? (
                                <>
                                  <div className="font-bold text-blue-900 dark:text-sky-200">{row.thursday.code}</div>
                                  <div className="text-xs text-blue-700/80 dark:text-sky-300/80 mt-0.5 font-medium">{lang === "th" ? row.thursday.nameTh : row.thursday.nameEn}</div>
                                  <div className="flex flex-col gap-0.5 mt-1.5 pt-1.5 border-t border-blue-100/30 dark:border-sky-900/10 text-[10px] text-blue-600/70 dark:text-sky-400/70 text-left">
                                    {row.thursday.room && (
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-blue-500/60 dark:text-sky-500/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span>{lang === "th" ? `ห้อง: ${row.thursday.room}` : `Room: ${row.thursday.room}`}</span>
                                      </div>
                                    )}
                                    {(row.thursday.instructorEn || row.thursday.instructorTh) && (
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-blue-500/60 dark:text-sky-500/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="truncate">{lang === "th" ? row.thursday.instructorTh : row.thursday.instructorEn}</span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                "-"
                              )}
                            </td>
                          )}
                          {/* Friday */}
                          {spans[index].friday.shouldRender && (
                            <td
                              rowSpan={spans[index].friday.rowSpan}
                              onClick={() => row.friday && setSelectedClass(row.friday)}
                              className={row.friday ? "py-4 px-4 text-sm bg-blue-50/70 dark:bg-sky-950/30 border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:scale-[1.01] hover:shadow-sm transform transition-all duration-200" : "py-4 px-4 text-sm text-center text-zinc-400 dark:text-zinc-600 border border-zinc-300 dark:border-zinc-700"}
                            >
                              {row.friday ? (
                                <>
                                  <div className="font-bold text-blue-900 dark:text-sky-200">{row.friday.code}</div>
                                  <div className="text-xs text-blue-700/80 dark:text-sky-300/80 mt-0.5 font-medium">{lang === "th" ? row.friday.nameTh : row.friday.nameEn}</div>
                                  <div className="flex flex-col gap-0.5 mt-1.5 pt-1.5 border-t border-blue-100/30 dark:border-sky-900/10 text-[10px] text-blue-600/70 dark:text-sky-400/70 text-left">
                                    {row.friday.room && (
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-blue-500/60 dark:text-sky-500/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span>{lang === "th" ? `ห้อง: ${row.friday.room}` : `Room: ${row.friday.room}`}</span>
                                      </div>
                                    )}
                                    {(row.friday.instructorEn || row.friday.instructorTh) && (
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-blue-500/60 dark:text-sky-500/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="truncate">{lang === "th" ? row.friday.instructorTh : row.friday.instructorEn}</span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                "-"
                              )}
                            </td>
                          )}
                          {/* Saturday */}
                          {spans[index].saturday.shouldRender && (
                            <td
                              rowSpan={spans[index].saturday.rowSpan}
                              onClick={() => row.saturday && setSelectedClass(row.saturday)}
                              className={row.saturday ? "py-4 px-4 text-sm bg-blue-50/70 dark:bg-sky-950/30 border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:scale-[1.01] hover:shadow-sm transform transition-all duration-200" : "py-4 px-4 text-sm text-center text-zinc-400 dark:text-zinc-600 border border-zinc-300 dark:border-zinc-700"}
                            >
                              {row.saturday ? (
                                <>
                                  <div className="font-bold text-blue-900 dark:text-sky-200">{row.saturday.code}</div>
                                  <div className="text-xs text-blue-700/80 dark:text-sky-300/80 mt-0.5 font-medium">{lang === "th" ? row.saturday.nameTh : row.saturday.nameEn}</div>
                                  <div className="flex flex-col gap-0.5 mt-1.5 pt-1.5 border-t border-blue-100/30 dark:border-sky-900/10 text-[10px] text-blue-600/70 dark:text-sky-400/70 text-left">
                                    {row.saturday.room && (
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-blue-500/60 dark:text-sky-500/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span>{lang === "th" ? `ห้อง: ${row.saturday.room}` : `Room: ${row.saturday.room}`}</span>
                                      </div>
                                    )}
                                    {(row.saturday.instructorEn || row.saturday.instructorTh) && (
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-blue-500/60 dark:text-sky-500/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="truncate">{lang === "th" ? row.saturday.instructorTh : row.saturday.instructorEn}</span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                "-"
                              )}
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
