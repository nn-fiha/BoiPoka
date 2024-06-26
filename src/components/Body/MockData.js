const MockData= [{
    "images": "/images/book1.jpeg",
    "book_title": "আগুনের পরশমণি",
    "author": "হুমায়ূন আহমেদ",
    "genre": "Fiction",
    "publication_date": "3/12/1950",
    "language": "Bangla",
    "pages": 442,
    "publisher": "হাতেখড়ি",
    "price": 44.96,
    "availability": false,
    "rating": 1.8
  }, {
    "images": "/images/book2.jpeg",
    "book_title": "রাশা",
    "author": "মুহম্মদ জাফর ইকবাল",
    "genre": "Sci-Fiction",
    "publication_date": "9/20/1914",
    "language": "Bangla",
    "pages": 241,
    "publisher": "Wikivu",
    "price": 44.15,
    "availability": false,
    "rating": 3.0
  }, {
    "images": "/images/book3.jpg",
    "book_title": "কালপুরুষ",
    "author": "সমরেশ মজুমদার",
    "genre": "Mystery",
    "publication_date": "5/18/1906",
    "language": "Bangla",
    "pages": 510,
    "publisher": "Dynabox",
    "price": 67.79,
    "availability": false,
    "rating": 4.6
  }, {
    "images": "/images/book4.jpeg",
    "book_title": "আমি তপু",
    "author": "মুহম্মদ জাফর ইকবাল",
    "genre": "Science Fiction",
    "publication_date": "12/26/1920",
    "language": "Bangla",
    "pages": 388,
    "publisher": "Twinder",
    "price": 70.68,
    "availability": true,
    "rating": 1.4
  }, {
    "images": "/images/book5.jpg",
    "book_title": "সাতকাহন (অখণ্ড)",
    "author": "সমরেশ মজুমদার",
    "genre": "Romance",
    "publication_date": "2/3/1906",
    "language": "Bangla",
    "pages": 461,
    "publisher": "Topicware",
    "price": 73.61,
    "availability": false,
    "rating": 4.3
  }, {
    "images": "/images/book6.jpeg",
    "book_title": "উত্তরাধিকার",
    "author": "সমরেশ মজুমদার",
    "genre": "Romance",
    "publication_date": "1/6/1942",
    "language": "Bangla",
    "pages": 774,
    "publisher": "Podcat",
    "price": 92.16,
    "availability": true,
    "rating": 1.3
  }, {
    "images": "/images/book7.jpeg",
    "book_title": "কালবেলা",
    "author": "সমরেশ মজুমদার",
    "genre": "Romance",
    "publication_date": "12/15/1922",
    "language": "Bangla",
    "pages": 728,
    "publisher": "Mudo",
    "price": 6.18,
    "availability": true,
    "rating": 4.0
  }, {
    "images": "/images/book8.jpeg",
    "book_title": "গাভী বিত্তান্ত",
    "author": " আহমদ ছফা",
    "genre": "Non-Fiction",
    "publication_date": "1/7/1953",
    "language": "Bangla",
    "pages": 393,
    "publisher": "Gigabox",
    "price": 9.75,
    "availability": true,
    "rating": 4.0
  }, {
    "images": "/images/book9.jpeg",
    "book_title": "প্রথম আলো (১)",
    "author": " সুনীল গঙ্গোপাধ্যায়",
    "genre": "Science Fiction",
    "publication_date": "1/26/1991",
    "language": "Bangla",
    "pages": 169,
    "publisher": "Skyba",
    "price": 44.36,
    "availability": true,
    "rating": 2.7
  }, {
    "book_title": "প্রথম আলো (2)",
    "images": "/images/book10.jpeg",
    "author": "সুনীল গঙ্গোপাধ্যায়",
    "genre": "Fiction",
    "publication_date": "3/9/1970",
    "language": "Bangla",
    "pages": 1152,
    "publisher": "Thoughtblab",
    "price": 20.09,
    "availability": false,
    "rating": 3.0
  }, {
    "book_title": "সেই সময় (অখণ্ড)",
    "images": "/images/book11.jpeg",
    "author": "সুনীল গঙ্গোপাধ্যায়",
    "genre": "Non-Fiction",
    "publication_date": "7/5/2011",
    "language": "Bangla",
    "pages": 460,
    "publisher": "Gigashots",
    "price": 27.23,
    "availability": true,
    "rating": 2.8
  }, {
    "book_title": "পদ্মজা",
    "images": "/images/book12.jpg",
    "author": "ইলমা বেহরোজ",
    "genre": "Mystery",
    "publication_date": "7/24/2019",
    "language": "Bangla",
    "pages": 571,
    "publisher": "Mymm",
    "price": 39.11,
    "availability": false,
    "rating": 4.8
  }, {
    "book_title": "কাকাবাবু ও আশ্চর্য দ্বীপ",
    "images": "/images/book13.jpeg",
    "author": "সুনীল গঙ্গোপাধ্যায়",
    "genre": "Science Fiction",
    "publication_date": "1/29/1966",
    "language": "Bangla",
    "pages": 1289,
    "publisher": "Yamia",
    "price": 35.22,
    "availability": false,
    "rating": 1.4
  }, {
    "book_title": "শেষের কবিতা",
    "images": "/images/book14.png",
    "author": "রবীন্দ্রনাথ ঠাকুর",
    "genre": "Fiction",
    "publication_date": "3/26/1945",
    "language": "Bangla",
    "pages": 1148,
    "publisher": "Fatz",
    "price": 99.31,
    "availability": true,
    "rating": 4.1
  }, {
    "book_title": "গীতাঞ্জলী",
    "images": "/images/book15.png",
    "author": "রবীন্দ্রনাথ ঠাকুর",
    "genre": "Non-Fiction",
    "publication_date": "2/27/1987",
    "language": "Bangla",
    "pages": 1001,
    "publisher": "Eimbee",
    "price": 19.62,
    "availability": false,
    "rating": 4.9
  }, {
    "book_title": "নৌকাডুবি",
    "images": "/images/book16.jpeg",
    "author": "রবীন্দ্রনাথ ঠাকুর",
    "genre": "Fiction",
    "publication_date": "3/20/1986",
    "language": "Bangla",
    "pages": 641,
    "publisher": "Rhybox",
    "price": 80.35,
    "availability": false,
    "rating": 4.4
  }, {
    "book_title": "যোগাযোগ",
    "images": "/images/book17.jpeg",
    "author": "Jodi Mateu",
    "genre": "Science Fiction",
    "publication_date": "6/4/1924",
    "language": "Bangla",
    "pages": 106,
    "publisher": "Realbridge",
    "price": 29.84,
    "availability": false,
    "rating": 1.1
  }, {
    "book_title": "গল্পগুচ্ছ",
    "images": "/images/book18.webp",
    "author": "রবীন্দ্রনাথ ঠাকুর",
    "genre": "Romance",
    "publication_date": "2/10/1926",
    "language": "Bangla",
    "pages": 84,
    "publisher": "Livefish",
    "price": 45.0,
    "availability": true,
    "rating": 2.2
  }, {
    "book_title": "চোখের বালি",
    "images": "/images/book19.webp",
    "author": "রবীন্দ্রনাথ ঠাকুর",
    "genre": "Romance",
    "publication_date": "6/15/1934",
    "language": "Bangla",
    "pages": 1200,
    "publisher": "Thoughtbridge",
    "price": 29.0,
    "availability": true,
    "rating": 4.0
  }, {
    "book_title": "ডাকঘর",
    "images": "/images/book20.jpg",
    "author": "রবীন্দ্রনাথ ঠাকুর",
    "genre": "Non-Fiction",
    "publication_date": "9/4/2006",
    "language": "Bangla",
    "pages": 1215,
    "publisher": "DabZ",
    "price": 52.28,
    "availability": true,
    "rating": 3.1
  }, {
    "book_title": "বলাকা",
    "images": "/images/book21.webp",
    "author": "রবীন্দ্রনাথ ঠাকুর",
    "genre": "Mystery",
    "publication_date": "8/1/1913",
    "language": "Bangla",
    "pages": 806,
    "publisher": "Kwilith",
    "price": 40.55,
    "availability": true,
    "rating": 1.2
  }, {
    "book_title": "রবীন্দ্রনাথের ছোটগল্প",
    "images": "/images/book22.jpg",
    "author": "রবীন্দ্রনাথ ঠাকুর",
    "genre": "Science Fiction",
    "publication_date": "4/9/2005",
    "language": "Bangla",
    "pages": 533,
    "publisher": "Kayveo",
    "price": 98.66,
    "availability": false,
    "rating": 1.2
  }, {
    "book_title": "কেউ কেউ কথা রাখে",
    "images": "/images/book23.jpeg",
    "author": "মোহাম্মদ নাজিম উদ্দিন",
    "genre": "Thriller",
    "publication_date": "6/9/1993",
    "language": "Bangla",
    "pages": 1005,
    "publisher": "Zoomzone",
    "price": 7.77,
    "availability": true,
    "rating": 1.3
  }, {
    "book_title": "রবীন্দ্রনাথ এখানে কখনও খেতে আসেননি",
    "images": "/images/book24.jpg",
    "author": "মোহাম্মদ নাজিম উদ্দিন",
    "genre": "Thriller",
    "publication_date": "5/31/1977",
    "language": "Bangla",
    "pages": 1077,
    "publisher": "Realfire",
    "price": 36.22,
    "availability": true,
    "rating": 3.7
  }, {
    "book_title": "রবীন্দ্রনাথ এখানে কখনও আসেননি",
    "images": "/images/rb2.jpg",
    "author": "মোহাম্মদ নাজিম উদ্দিন",
    "genre": "Thriller",
    "publication_date": "5/27/1964",
    "language": "Bangla",
    "pages": 356,
    "publisher": "Pixope",
    "price": 43.58,
    "availability": false,
    "rating": 1.6
  }, {
    "book_title": "করাচি",
    "images": "/images/korachi.jpg",
    "author": "মোহাম্মদ নাজিম উদ্দিন",
    "genre": "Thriller",
    "publication_date": "12/11/1977",
    "language": "Bangla",
    "pages": 210,
    "publisher": "Innotype",
    "price": 63.75,
    "availability": true,
    "rating": 2.1
  }, {
    "book_title": "নেক্সট",
    "images": "/images/next.jpg",
    "author": "মোহাম্মদ নাজিম উদ্দিন",
    "genre": "Thriller",
    "publication_date": "2/9/1939",
    "language": "Bangla",
    "pages": 663,
    "publisher": "Skyba",
    "price": 14.86,
    "availability": false,
    "rating": 4.4
  }, {
    "book_title": "কনফেশন",
    "images": "/images/confession.jpg",
    "author": "মোহাম্মদ নাজিম উদ্দিন",
    "genre": "Thriller",
    "publication_date": "7/13/1919",
    "language": "Bangla",
    "pages": 220,
    "publisher": "Yabox",
    "price": 16.9,
    "availability": false,
    "rating": 4.8
  }, {
    "book_title": "	নেমেসিস",
    "images": "/images/nemesis.jpg",
    "author": "মোহাম্মদ নাজিম উদ্দিন",
    "genre": "Thriller",
    "publication_date": "2/4/2020",
    "language": "Bangla",
    "pages": 809,
    "publisher": "Gabcube",
    "price": 77.3,
    "availability": true,
    "rating": 3.5
  }, {
    "book_title": "কন্ট্রাক্ট",
    "images": "/images/contract.jpg",
    "author": "মোহাম্মদ নাজিম উদ্দিন",
    "genre": "Thriller",
    "publication_date": "11/21/1935",
    "language": "Bangla",
    "pages": 1409,
    "publisher": "Blogtag",
    "price": 29.74,
    "availability": true,
    "rating": 4.4
  }];
  
  export default MockData;