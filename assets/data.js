window.PSX = {
  ver: 1,
  module: {
    title: "Tibbiy psixologiya va şaxslararo muloqot",
    short: "Tibbiy psixologiya",
    author: "Axmedova Roxila",
    author_role: "Fan öqituvçisi",
    org: "Şahrisabz Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi",
    region: "Qaşqadaryo viloyati",
    year: "2026–2027 öquv yili",
    semester: "I semestr",
    language: "Özbek tili"
  },

  /* Umumiy kontent bloklari: fayl assets/topics/<id>.js */
  blocks: {
    t01: { short: "Fanga kiriş va tarix", color: "blue",   posters: [["p01_salomatlik_psixologiyasi", "Salomatlik psixologiyasi"]] },
    t02: { short: "Ong, sezgi va idrok",   color: "pink",   posters: [["p02_sezgi_idrok", "Oliy nerv faoliyati: sezgi va idrok"]] },
    t03: { short: "Diqqat va xotira",      color: "indigo", posters: [["p03_diqqat_xotira", "Diqqat va xotira"]] },
    t04: { short: "Tafakkur, nutq, emotsiya, iroda", color: "purple", posters: [["p04a_xotira_tafakkur_nutq", "Xotira, tafakkur va nutq"], ["p04b_emotsional_irodaviy", "Emotsional-irodaviy soha"]] },
    t05: { short: "Tekşiriş usullari",   color: "teal",   posters: [["p05a_kuzatish_suhbat_sorov", "Kuzatiş, suhbat va sörov usullari"], ["p05b_tekshirish_usullari", "Psixologik tekşiriş usullari"]] },
    t06: { short: "Baholaş şkalalari",   color: "orange", posters: [["p06_baholash_shkalalari", "Baholaş şkalalari va anketalar"]], interactive: ["scales"] },
    t07: { short: "Tekşiruv amaliyoti",   color: "green",  posters: [["p07a_tekshiruv_amaliyoti", "Bemorni psixologik tekşiruvdan ötkaziş"], ["p07b_dastlabki_suhbat", "Dastlabki suhbat va kuzatuv"]] },
    t08: { short: "Natijalarni tahlil qiliş", color: "blue", posters: [["p08a_tahlil_qoidalari", "Tahlil qiliş qoidalari"], ["p08b_tahlil_xulosa", "Tahlil va xulosa yoziş"]] },
    t09: { short: "Xulosa yoziş",         color: "indigo", posters: [["p09_xulosa_yozish", "Xulosa yoziş qoidalari"]] },
    t10: { short: "Şaxs, temperament, xarakter", color: "pink", posters: [["p10_shaxs_temperament", "Şaxs, temperament va xarakter"]], interactive: ["temperament"] },
    t11: { short: "Yoşga xos xususiyatlar", color: "orange", posters: [["p11_yoshga_xos", "Yoşga xos psixologik xususiyatlar"]] },
    t12: { short: "Holatni baholaş maşqlari", color: "green", posters: [["p07b_dastlabki_suhbat", "Dastlabki suhbat va kuzatuv"]] },
    t13: { short: "Kasallikka reaksiya",   color: "purple", posters: [["p13a_kasallikka_munosabat", "Kasallikka munosabat turlari"], ["p13b_ichki_manzara", "Kasallikning içki manzarasi"]] },
    t14: { short: "Stress va koping",      color: "teal",   posters: [["p14a_stress_koping", "Stress va koping strategiyalari"], ["p14b_stress_koping", "Stress bosqiçlari va moslaşuv"]], interactive: ["breath"] },
    t15: { short: "Yondaşuv turlari",     color: "blue",   posters: [["p15a_yondashuv_turlari", "Psixologik yondaşuv turlari"], ["p15b_yondashuv_tanlash", "Yondaşuvni tanlaş mezonlari"]] },
    t16: { short: "Yondaşuvni tanlaş",   color: "indigo", posters: [["p15b_yondashuv_tanlash", "Yondaşuvni tanlaş mezonlari"]] },
    t17: { short: "Case-study",            color: "orange", posters: [["p17_case_study", "Turli reaksiyadagi bemorlar bilan işlaş"]] },
    t18: { short: "Etika va deontologiya", color: "red",    posters: [["p18_etika_deontologiya", "Tibbiy etika va deontologiya"]] },
    t19: { short: "Muloqot psixologiyasi", color: "teal",   posters: [["p19_muloqot_psixologiyasi", "Verbal va noverbal muloqot"]] },
    t20: { short: "Terapevtik muloqot",    color: "pink",   posters: [["p20_terapevtik_muloqot", "Terapevtik muloqot"]] },
    t21: { short: "Inqiroz va nizolarda muloqot", color: "purple", posters: [["p20_terapevtik_muloqot", "Terapevtik muloqot"]] },
    t22: { short: "Professional muloqot",  color: "green",  posters: [["p19_muloqot_psixologiyasi", "Verbal va noverbal muloqot"]] },
    t23: { short: "Etika prinsiplari",     color: "red",    posters: [["p18_etika_deontologiya", "Tibbiy etika va deontologiya"]] },
    t24: { short: "Psixogigiyena va psixoterapiya", color: "green", posters: [["p01_salomatlik_psixologiyasi", "Salomatlik psixologiyasi"]], interactive: ["breath"] },
    t25: { short: "Turli yoşdagi bemorlar", color: "orange", posters: [["p11_yoshga_xos", "Yoşga xos psixologik xususiyatlar"]] },
    t26: { short: "Yomon xabar: SPIKES",   color: "indigo", posters: [], interactive: ["spikes"] }
  },

  /* Yo'nalişlar: KMR bo'yiça tartib, nom, soat */
  directions: {
    h: {
      name: "Hamşiralik işi",
      code: "50910208",
      hours: { jami: 60, nazariy: 30, amaliy: 10, mustaqil: 20 },
      topics: [
        ["Tibbiy psixologiya fanining predmeti, maqsad va vazifalari, rivojlaniş tarixi", "N", ["t01"]],
        ["Psixik jarayonlar: ong, sezgi va idrok, ularning buzilişlari", "N", ["t02"]],
        ["Diqqat va xotira jarayonlari, ularning buzilişlari", "N", ["t03"]],
        ["Tafakkur, nutq, emotsiya va iroda jarayonlari, ularning buzilişlari", "N", ["t04"]],
        ["Psixologik tekşiriş usullari: kuzatiş, suhbat, test, anketa", "N", ["t05"]],
        ["Psixologik baholaş şkalalari va anketalar", "N", ["t06"]],
        ["Bemorni psixologik tekşiruvdan ötkaziş amaliyoti", "A", ["t07"]],
        ["Psixologik test va kuzatuv natijalarini tahlil qiliş qoidalari", "N", ["t08"]],
        ["Test natijalari asosida xulosa yoziş qoidalari", "N", ["t09"]],
        ["Şaxs, temperament va xarakter tuşunçalari", "N", ["t10"]],
        ["Bemorning yoşga xos psixologik xususiyatlari", "N", ["t11"]],
        ["Bemor psixologik holatini baholaş maşqlari", "A", ["t12"]],
        ["Kasallikka psixologik reaksiya turlari", "N", ["t13"]],
        ["Psixologik yondaşuv turlari va tanlaş mezonlari", "N", ["t15"]],
        ["Turli bemor holatlariga mos psixologik yondaşuvni tanlaş tamoyillari", "N", ["t16"]],
        ["Vaziyatli masalalar (case-study) yeçiş", "A", ["t17"]],
        ["Tibbiy etika va deontologiya tamoyillari, bemor huquqlari va tibbiy maxfiylik", "N", ["t18"]],
        ["Terapevtik muloqot: faol tinglaş, empatiya, qöllab-quvvatlaş", "N", ["t20"]],
        ["Terapevtik muloqot könikmalarini maşq qiliş, inqirozli vaziyat va nizolarda muloqot", "A", ["t21"]],
        ["Bemor va uning yaqinlari bilan professional muloqot (yakuniy amaliy maşğulot)", "A", ["t22"]]
      ]
    },
    d: {
      name: "Davolaş işi",
      code: "50910204",
      hours: { jami: 60, nazariy: 32, amaliy: 8, mustaqil: 20 },
      topics: [
        ["Tibbiy psixologiya fanining predmeti, maqsad va vazifalari, rivojlaniş tarixi", "N", ["t01"]],
        ["Psixik jarayonlar: sezgi, idrok, diqqat va xotira, ularning buzilişlari", "N", ["t02", "t03"]],
        ["Tafakkur, nutq, emotsiya va iroda jarayonlari, ularning buzilişlari", "N", ["t04"]],
        ["Psixologik tekşiriş usullari: kuzatiş, suhbat, test, anketa", "N", ["t05"]],
        ["Psixologik baholaş şkalalari va anketalar (qörquv, xavotir, depressiya, stress)", "A", ["t06"]],
        ["Psixologik test va kuzatuv natijalarini tahlil qiliş qoidalari, natijalar asosida xulosa yoziş", "N", ["t08", "t09"]],
        ["Şaxs, temperament va xarakter tuşunçalari", "N", ["t10"]],
        ["Bemorning yoşga xos psixologik xususiyatlari", "N", ["t11"]],
        ["Kasallikka psixologik reaksiya turlari, kasallikning içki manzarasi", "N", ["t13"]],
        ["Stress, psixologik moslaşuv va koping (coping) strategiyalar", "N", ["t14"]],
        ["Psixologik yondaşuv turlari va tanlaş mezonlari", "N", ["t15"]],
        ["Turli reaksiyadagi bemorlar bilan işlaş amaliyoti, vaziyatli masalalar (case-study) yeçiş", "A", ["t17"]],
        ["Tibbiy etika va deontologiya tamoyillari, bemor huquqlari va tibbiy maxfiylik", "N", ["t18"]],
        ["Muloqot psixologiyasi: verbal va noverbal muloqot, muloqotdagi tösiqlar", "N", ["t19"]],
        ["Terapevtik muloqot: faol tinglaş, empatiya, qöllab-quvvatlaş (trening)", "A", ["t20"]],
        ["Bemor va uning yaqinlari bilan professional muloqot", "N", ["t22"]],
        ["Tibbiy etikaning asosiy prinsiplari: avtonomiya, zarar yetkazmaslik, foyda keltiriş, adolat, burç, hurmat va insonparvarlik", "N", ["t23"]],
        ["Psixogigiyena va psixoprofilaktika. Psixoterapevtik usullar (kognitiv, suhbat, relaksatsiya)", "N", ["t24"]],
        ["Turli yoş va toifadagi bemorlar (bolalar, kattalar, keksalar) bilan muloqot: ambulatoriya-poliklinika, terapiya, xirurgiya, ginekologiya, onkologiya", "N", ["t25"]],
        ["Oğir va terminal holatdagi bemorlar hamda ularning yaqinlari bilan muloqot. “Yomon xabar”ni SPIKES usuli böyiça yetkaziş (rolli öyin, trening)", "A", ["t26"]]
      ]
    }
  }
};
