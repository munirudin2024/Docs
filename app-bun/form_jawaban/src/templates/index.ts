import type { MahasiswaInfo, Soal } from "../types"
import arsitekturSistemEnterprise from "./arsitekturSistemEnterprise"
import dataWarehouse from "./dataWarehouse"
import enterpriseResourcePlanning from "./enterpriseResourcePlanning"
import knowledgeManagement from "./knowledgeManagement"
import rekayasaPerangkatLunak from "./rekayasaPerangkatLunak"
import bigDataForBusiness from "./bigDataForBusiness"
import etikaProfe from "./etikaProfe"
import inovasiKreatifDigital from "./inovasiKreatifDigital"
import interpersonalSkill from "./interpersonalSkill"

export type Template = {
  mahasiswa: MahasiswaInfo & { waktu?: string }
  judulUjian: string
  semester: string
  soalList: Soal[]
}

export const templates: Record<string, Template> = {
  arsitekturSistemEnterprise,
  dataWarehouse,
  enterpriseResourcePlanning,
  knowledgeManagement,
  rekayasaPerangkatLunak,
  bigDataForBusiness,
  etikaProfe,
  inovasiKreatifDigital,
  interpersonalSkill,
}