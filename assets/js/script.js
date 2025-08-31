// Dynamic Album Player System with Spotify Integration
class DynamicAlbumPlayer {
    constructor() {
        this.currentTrack = 1;
        this.totalTracks = 11;
        this.isTransitioning = false;
        this.spotifyData = null;
        this.isLoadingComplete = false; // Add loading state
        
        // Track data from markdown
        this.tracks = this.loadTracksFromMarkdown();
        
        this.init();
    }

    async init() {
        this.showLoadingScreen();
        await this.loadSpotifyData();
        this.generateNavigationDots();
        this.setupEventListeners();
        this.setupTitlePage(); // Setup title page events
        this.loadTrack(this.currentTrack, false); // Don't start animations yet
        
        // Hide loading screen and show title page
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showTitlePage();
            this.isLoadingComplete = true;
        }, 3000);
    }
    
    async loadSpotifyData() {
        try {
            const response = await fetch('spotify_links.json');
            this.spotifyData = await response.json();
            console.log('Spotify data loaded successfully');
        } catch (error) {
            console.error('Error loading Spotify data:', error);
        }
    }
    
    // Load track data dynamically from markdown or JSON
    loadTracksFromMarkdown() {
        return {
            1: {
                title: "son defa",
                image: "assets/img/01.png",
                spotifyKey: "son defa",
                content: {
                    paragraphs: [
                        "Kıyıdan seyretmek; mümkün olabilecek her şeyin kıyısından. Kıyı boşluğu gösterir, renksizliği, hissizliği. Anlam burada bulur kendini, mümkünlüğün kıyısında. Kim bakıyorsa odur sahibi anlamın; bulutu o çizer ya da toprağın kokusunu o içine çeker. Boşluktan bir varlık yaratır, ne olacağı bilinemeyen ya da ne olduğu. Tek bilebileceği şey onun sonsuzluktan doğduğudur. Sonsuzdur anlamın hayatı, ve aynı zamanda boşluk.",
                        "Kıyıdan ayrılma vakti. Kırık bir tablo. İşte ışık orada!"
                    ],
                    verses: [
                        "Bir tabloda uyutulan",
                        "İçi isyan dolu bir insan",
                        "Kaybolan bütün duygular",
                        "Saklanmış kuytuda",
                        "",
                        "Gözleri kapanmış",
                        "Sözcükleri yasaklanmış",
                        "Bir sıkıntı var içimde",
                        "Dünyaya karşı",
                        "Bir bulantı var içimde",
                        "Dünyaya karşı",
                        "",
                        "Tabloda bir sızıntı",
                        "Damlıyor her bir hayal",
                        "Bu çerçeve kırılmıyor hiçbir zaman",
                        "Umutlar var olmadan",
                        "Umutlar var olmuyor hiçbir zaman",
                        "Uykumdan uyanmadan",
                        "",
                        "Uyandı",
                        "Tüm zehirler vücudunda",
                        "Hayallere tutundu son bir defa",
                        "Kırıldı tüm zincirler aydınlığa",
                        "Bir adım daha atmak",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""
                    ]
                }
            },
            2: {
                title: "düşüş",
                image: "assets/img/02.png",
                spotifyKey: "düşüş",
                content: {
                    paragraphs: [
                        "İşte sonsuzluk. Kıyıdan hiç durmadan uzaklaşmak, arkana bile bakmadan. Tahmin edebilir miydin böyle olacağını? Hayır, ne olduğunu tahmin edemezdin, ne olacağını da. Tablonun çekmecelerinin kırıklığıydı bu, başka bir şey değil.",
                        "Düşüş. Yukarı doğru. Uçarken aşağı doğru... Dışarısı olmuş iç, her şey sanki bir hiç."
                    ],
                    verses: ["",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""]
                }
            },
            3: {
                title: "özgürlük",
                image: "assets/img/03.png",
                spotifyKey: "özgürlük",
                content: {
                    paragraphs: [
                        "Beklemek, beklemek, beklemek ve sonunda derin bir nefes almak. Bütün doğrular yanlışlanmalı, yanlışlar ise doğruluğa doğru bükülmeli. Üçü beşe eşitlemeli, dördü aradan çıkarmalı. Boşluğu anlamlandırmalı.",
                        "Tiyatro yıkıldı, roller yok oldu. Boşluğun kendini anlamlandırmasıydı bu. Kıyının bir fotoğrafıydı. Özgürlüğün hiçbir zaman kaybolmayacak varlığıydı."
                    ],
                    verses: [
                        "Mavi bir nehir",
                        "Karlar beyaz",
                        "Yapraklar yeşil",
                        "Hayat onun için rengarenk",
                        "Bu bir özgürlük",
                        "",
                        "Sadece koşmak istiyor",
                        "Neden biliyor",
                        "Ne kadar koşsa da",
                        "Artık bir tabloda değil",
                        "",
                        "Bir tiyatro değil",
                        "Artık hayatım",
                        "Bir sahne değil",
                        "Artık yaşantım",
                        "Bir rol değil",
                        "Bana verilen",
                        "Artık varım",
                        "Ve ben özgürüm!",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""
                    ]
                }
            },
            4: {
                title: "evsiz",
                image: "assets/img/04.png",
                spotifyKey: "evsiz",
                content: {
                    paragraphs: [
                        "Kıyı bazen kapıyı açmaktır, bazense kapatmak. Arkana döndüğünde hiçbir şey görememek. Sürekli yeniyi tatmak, onunla bütünleşmek. İnsanları ilk defa görmek, altından olmayan kalplerini...",
                        "İnsanlar her yerde, hiç susmuyorlar. Sen de susmuyorsun, susmamalısın, susmayacaksın.",
                        "Aradaki farkı anlayacaksın. Onlara kıyıdan bakacaksın. Duvarların arkasından uzun uzun bağıracaksın."
                    ],
                    verses: [
                        "Karşımda bir kapı",
                        "Açılır yeni bir dünyaya",
                        "Korkuyorum kapıyı çalmaya",
                        "Kim bilir ne var ardında",
                        "İnsanlar bakıyor yüzüme",
                        "Sanki tanıyorlar beni",
                        "Elimde bir kalem çiziyorum",
                        "Yüzüme bir gülümseme",
                        "Olmaz diyorlar",
                        "Sadece kendin ol",
                        "Ve gül",
                        "Sessizlik soldu bu defa",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""
                    ]
                }
            },
            5: {
                title: "mekanik hayat",
                image: "assets/img/05.png",
                spotifyKey: "mekanik_hayat",
                content: {
                    paragraphs: [
                        "Kutuların içinde insanlara bağıranlar, ruhlarını ele geçirenler. Satılmışlar ve satılmak üzere olanlar. Evet diyenler. Hayırı hiçe sayanlar, onu yok edenler. Efendimciler ve emirciler. Gölgelerini satmış olanlar. Yağmur altında ıslanmaya korkanlar. Dağlarda dolaşmaya vakit bulamayanlar. Derinlikleri unutanlar. Yüzeyde nefes alanlar.",
                        "İçeri girdiğin kapıyı yerinde bulamamak. Rüzgar yüzüne vuruyor ve sen geri dönemiyorsun. Anlıyor musun?"
                    ],
                    verses: ["",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""]
                }
            },
            6: {
                title: "kırmızı",
                image: "assets/img/06.png",
                spotifyKey: "kırmızı",
                content: {
                    paragraphs: [
                        "İşte o anda kırmızıyı yarattı. Yıldızlarla güneşi birleştirdi. Karanlığın hiç bilinmeyen noktalarındaki taşların özünü çaldı. Tan vaktinin rengini içine çekti ve onu yıldızlarla güneşin birleştiği noktaya üfledi. Parmaklarıyla ona bir beden verdi. Çizgilerini netleştirdi. Gözleri altındandı. Dudakları kıpkırmızıydı. İşte bu onun sanat eseriydi.",
                        "Önce kalbini aldı. Sonra öldürdü. Bedenini ise soğuk ateşlerde yaktı. Küllerini göklerden aşağıya savurdu..."
                    ],
                    verses: [
                        "Beni artık bırakın ne olur",
                        "Yuttular ruhumdaki o tınıyı",
                        "Bu nasıl bir şey",
                        "Daha önce böyle bir şey",
                        "Hiç hissetmedim",
                        "İçimdeki esaret kayboluyor",
                        "Seni kokladıkça",
                        "Kırmızı...",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""
                    ]
                }
            },
            7: {
                title: "kırmızının külleri",
                image: "assets/img/07.png",
                spotifyKey: "kırmızının_külleri",
                content: {
                    paragraphs: [
                        "\"Şu gökten düşen küller kimin? İnsan kendi küllerini kucaklayabilir mi? İnanmaya karşı ihanet. İşte ölümün formülü. Vücudumdaki yara izlerini görüyor musunuz? Peki ya şu akan Kırmızı kanı? Vücudumdan taşan. Sokaklarda dolaşan. İnancımın böylesine sarsılmasına, yok olmasına dayanabilir miyim? Kırmızı, beni neden terk ettin?\"",
                        "Ölmek. Nabzın giderek yavaşlaması ve durması. Sıradan.",
                        "Ölmek. İnandığını kaybetmek. Çarmıha gerilmek."
                    ],
                    verses: [
                        "Kırmızının külleri uçuyor",
                        "Varlığı boşluğun canımı yakıyor",
                        "Sessizlik sarıyor havayı ihanetin",
                        "Aslında kül olan o değil ben miyim?",
                        "Ben seni hissederken",
                        "Sen",
                        "",
                        "Yüzüyor suda hikayeler",
                        "Yansıyor yüzüme bütün o cümleler",
                        "Hakimi sanırken durumun",
                        "Nesnesi olmak hayatın",
                        "Ben sana inanırken",
                        "Sen beni mahvettin",
                        "",
                        "Kurdular fikirleri",
                        "",
                        "Sundular gölgeyi",
                        "",
                        "Çaldılar gerçeği",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""
                    ]
                }
            },
            8: {
                title: "çıkış yok",
                image: "assets/img/08.png",
                spotifyKey: "çıkış_yok",
                content: {
                    paragraphs: [
                        "\"Çıkış kapılarında hep aynı duvar. Kapı! Duvar! Kapı! Duvar! Halbuki ilk kapının önünde durduğum anı hatırlıyorum. Sonsuzluktu her şey.\"",
                        "Çıkışlar kapalı. Çekmeceler kırık. Feryatlar sessiz. Denizler derin. Kalpler karanlık."
                    ],
                    verses: [
                        "Gölgeler korkutuyor beni",
                        "Sen hiç gölgelere direndin mi?",
                        "Bir çocuk öldüğünde susmalı mı?",
                        "Canlar yitip giderken kaçmalı mı?",
                        "",
                        "İnsanlık öldü duydunuz mu?",
                        "Vicdan kayboldu unuttunuz mu?",
                        "Karanlık çevreliyor her yanımı",
                        "Gölgeler vuruyor her gün kalbime",
                        "",
                        "Susmak yedi bitirdi beni",
                        "Hala zamanı gelmedi mi?",
                        "",
                        "Ve işte karşımda bir gölge...",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""
                    ]
                }
            },
            9: {
                title: "fantasmagorya",
                image: "assets/img/09.png",
                spotifyKey: "fantasmagorya",
                content: {
                    paragraphs: [
                        "\"Kıyıdan bakıyorum hala hayata. Bu gölgeleri gerçekten ben mi yarattım? Özgürlüğümü bir kapının paspasında yitirdim. Böyle olacağını bilemezdim.\"",
                        "Yerlerinizi alamazsınız. Bizzat oynamak zorundasınız. Gölgelerinizi siz satmadınız mı? Özgürlüğünüzü gölgeleri yaratmak için feda etmediniz mi? Başrollerin üzerinde bir rol daha var.",
                        "Gölgeler yok edilmeli.",
                        "Hem de bir daha hiç geri dönmemecesine."
                    ],
                    verses: ["",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""]
                }
            },
            10: {
                title: "mavide boğulma",
                image: "assets/img/10.png",
                spotifyKey: "mavide_boğulma",
                content: {
                    paragraphs: [
                        "Suya düştü. Boğulmak üzere olduğunu sandı. Sonra derin bir nefes aldı. Su baloncuklarının içinde birbirlerinin gözlerine bakanları gördü. Mürekkepleriyle hayatlarını resmeden balıkları. Deniz kabuklarının içine saklanmış, ucu bucağı olmayan evleri. Kollarından tutup sanki ona yol gösteren balinaları.",
                        "Bir bisiklet buldu. Suyun dibine inmeliydi. Gözlerinden yaşlar süzüldü. Gerçekleşmeyenin göz yaşları."
                    ],
                    verses: [
                        "Hayaller gibi bazı şeyler",
                        "Anlatmak yetmez",
                        "Yaşamak gerek birer birer...",
                        "",
                        "Düşlerin içinde bir ses",
                        "Kal diyor bitmeyen nefesimde",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""
                    ]
                }
            },
            11: {
                title: "renk",
                image: "assets/img/11.png",
                spotifyKey: "renk",
                content: {
                    paragraphs: [
                        "Kıyıdan yaratıldı tüm renkler. Boşluğun sonsuzluğunda iç içe geçti her şey. Kesin çizgilerin muğlaklaşmasıyla son buluyor. Şu uçan kelebeği görüyor musun? Maviyi bulmuş sanki.",
                        "Tablo ve insan. Daha fazla tablo, daha fazla insan. Tablonun olmadığı tek nokta yok. İçinde insanlar. Kurtulmaya çalışıyorlar. Bilmiyorlar. Belki de Tanrı olmak budur. Her şeyin üzerinde. Her şeyin ötesinde. Özgürlükten daha ağır. Kırmızıdan daha yoğun. Maviden daha derin."
                    ],
                    verses: [
                        "Kaybolan bir adam",
                        "Yalnız başına",
                        "Renkleri izliyor",
                        "Özgürlüğün mavisini arıyor",
                        "Kırmızı ise çoktan kaybolmuş",
                        "",
                        "Yeşil dakikalar uzakta",
                        "Geçmiyor buralardan yıllardır",
                        "Sarının canlılığı",
                        "Artık yansımıyor bu hayata",
                        "",
                        "Hayatı grilikte",
                        "Siyaha çalan",
                        "Masum bir çocuk bakıyor",
                        "Beyazların içinde",
                        "",
                        "Ve bir kelebek mavinin",
                        "Derinliklerinde uçuyor",
                        "",
                        "Esiyor rüzgar...",
                        "",
                        "Rüzgar kuzeyden",
                        "Üşüyor adam",
                        "Bıkmış artık",
                        "Ne soğuk diyor",
                        "Ne de ölüm",
                        "Haykırıyor umutsuzca",
                        "\"Artık gri yok",
                        "Hayat siyah...\"",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""
                    ]
                }
            }
            // All tracks complete
        };
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.display = 'flex';
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
    }

    showTitlePage() {
        const titlePage = document.getElementById('titlePage');
        titlePage.style.display = 'flex';
        // Hide all other UI elements
        this.hideUIElements();
    }

    hideTitlePage() {
        const titlePage = document.getElementById('titlePage');
        titlePage.classList.add('hidden');
        setTimeout(() => {
            titlePage.style.display = 'none';
            // Show UI elements and start first track
            this.showUIElements();
            this.startTrackAnimations(this.tracks[this.currentTrack].content);
        }, 1000);
    }

    hideUIElements() {
        // Hide navigation, controls, spotify widget
        const elements = [
            'navDots', 'prevBtn', 'nextBtn', 'audioControls', 'spotifyWidget'
        ];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        });
    }

    showUIElements() {
        // Show navigation, controls, spotify widget
        const elements = [
            'navDots', 'prevBtn', 'nextBtn', 'audioControls', 'spotifyWidget'
        ];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = '';
        });
    }

    setupTitlePage() {
        // Play button event
        const playButton = document.getElementById('playButton');
        playButton.addEventListener('click', () => {
            this.hideTitlePage();
        });

        // Credits toggle event
        const creditsToggle = document.getElementById('creditsToggle');
        const creditsContent = document.getElementById('creditsContent');
        
        creditsToggle.addEventListener('click', () => {
            creditsToggle.classList.toggle('expanded');
            creditsContent.classList.toggle('expanded');
        });
    }
    
    generateNavigationDots() {
        const navDots = document.getElementById('navDots');
        navDots.innerHTML = '';
        
        for (let i = 1; i <= this.totalTracks; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.dataset.track = i;
            if (i === this.currentTrack) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => this.goToTrack(i));
            navDots.appendChild(dot);
        }
    }
    
    loadTrack(trackNumber) {
        if (this.isTransitioning) return;
        
        const track = this.tracks[trackNumber];
        if (!track) {
            console.error(`Track ${trackNumber} not found`);
            return;
        }
        
        this.isTransitioning = true;
        
        // Update track info
        document.getElementById('trackNumber').textContent = trackNumber.toString().padStart(2, '0');
        document.getElementById('trackTotal').textContent = `/ ${this.totalTracks}`;
        
        // Update background image
        const backgroundImage = document.getElementById('backgroundImage');
        backgroundImage.style.backgroundImage = `url('${track.image}')`;
        
        // Update title
        const trackTitle = document.getElementById('trackTitle');
        trackTitle.textContent = track.title;
        
        // Update content
        this.updateTrackContent(track.content);
        
        // Setup audio
        this.setupAudio(track.audio);
        
        // Update navigation
        this.updateNavigationDots();
        
        // Reset animations
        this.resetAnimations();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1500);
    }
    
    updateTrackContent(content, startAnimations = true) {
        const trackText = document.getElementById('trackText');
        trackText.innerHTML = '';
        
        // Add paragraphs
        content.paragraphs.forEach((paragraph, paragraphIndex) => {
            const p = document.createElement('p');
            p.className = 'paragraph';
            p.setAttribute('data-text', paragraph); // Store original text
            trackText.appendChild(p);
        });
        
        // Add verses if they exist
        if (content.verses && content.verses.length > 0) {
            const poemDiv = document.createElement('div');
            poemDiv.className = 'poem';
            
            content.verses.forEach((verse, verseIndex) => {
                const verseP = document.createElement('p');
                verseP.className = 'verse';
                verseP.setAttribute('data-text', verse); // Store original text
                poemDiv.appendChild(verseP);
            });
            
            trackText.appendChild(poemDiv);
        }
    }

    startTrackAnimations(content) {
        let totalDelay = 800; // Start after 800ms
        
        // Animate paragraphs character by character
        const paragraphs = document.querySelectorAll('.paragraph');
        paragraphs.forEach((p, index) => {
            const text = p.getAttribute('data-text');
            this.typeText(p, text, totalDelay, 60); // 60ms per character for paragraphs
            
            // Calculate actual duration based on text length and speed
            const actualDuration = this.calculateTypingDuration(text, 60);
            totalDelay += actualDuration + 1200; // Actual duration + 1200ms pause
        });
        
        // Animate verses character by character
        const verses = document.querySelectorAll('.verse');
        if (verses.length > 0) {
            totalDelay += 1500; // Extra pause before verses
            verses.forEach((v, index) => {
                const text = v.getAttribute('data-text');
                this.typeText(v, text, totalDelay, 60); // 60ms per character for verses
                
                // Calculate actual duration based on text length and speed
                const actualDuration = this.calculateTypingDuration(text, 60);
                totalDelay += actualDuration + 800; // Actual duration + 800ms pause
            });
        }
    }

    // Calculate the actual duration of typing animation including punctuation delays
    calculateTypingDuration(text, baseSpeed) {
        let totalDuration = 0;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            let charDelay = baseSpeed;
            
            // Apply same logic as in typeText function
            if (char === '.' || char === '!' || char === '?') {
                charDelay = baseSpeed * 10;
            } else if (char === ',' || char === ';' || char === ':') {
                charDelay = baseSpeed * 10;
            } else if (char === ' ') {
                charDelay = baseSpeed * 0.7;
            } else {
                // Average for randomness (no randomness in calculation for consistency)
                charDelay = baseSpeed;
            }
            
            totalDuration += charDelay;
        }
        
        return totalDuration;
    }

    typeText(element, text, delay, speed) {
        setTimeout(() => {
            element.innerHTML = '';
            let charIndex = 0;
            
            const typeCharacter = () => {
                if (charIndex < text.length) {
                    element.innerHTML += text[charIndex];
                    charIndex++;
                    
                    // Add specific timing for punctuation
                    let nextDelay = speed;
                    const char = text[charIndex - 1];
                    
                    // 10x delay for major punctuation marks
                    if (char === '.' || char === '!' || char === '?') {
                        nextDelay = speed * 10;
                    } else if (char === ',' || char === ';' || char === ':') {
                        nextDelay = speed * 10; // Also 10x for commas and semicolons
                    } else if (char === ' ') {
                        nextDelay = speed * 0.7; // Spaces are faster
                    } else {
                        // Add slight randomness (±15%)
                        nextDelay = speed + (Math.random() - 0.5) * speed * 0.3;
                    }
                    
                    setTimeout(typeCharacter, nextDelay);
                }
            };
            
            typeCharacter();
        }, delay);
    }
    
    setupEventListeners() {
        // Navigation dots (will be generated dynamically)
        
        // Navigation arrows
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        prevBtn.addEventListener('click', () => this.previousTrack());
        nextBtn.addEventListener('click', () => this.nextTrack());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Touch/Swipe controls
        this.setupTouchControls();
    }
    
    loadTrack(trackNumber, startAnimations = true) {
        if (this.isTransitioning) return;
        
        const track = this.tracks[trackNumber];
        if (!track) {
            console.error(`Track ${trackNumber} not found`);
            return;
        }
        
        this.isTransitioning = true;
        
        // Update track info displays - check if elements exist
        const trackNumberEl = document.getElementById('trackNumber');
        const trackTotalEl = document.getElementById('trackTotal');
        const trackNumberControlEl = document.getElementById('trackNumberControl');
        const trackTotalControlEl = document.getElementById('trackTotalControl');
        const trackNameControlEl = document.getElementById('trackNameControl');
        
        if (trackNumberEl) trackNumberEl.textContent = trackNumber.toString().padStart(2, '0');
        if (trackTotalEl) trackTotalEl.textContent = `/ ${this.totalTracks}`;
        if (trackNumberControlEl) trackNumberControlEl.textContent = trackNumber.toString().padStart(2, '0');
        if (trackTotalControlEl) trackTotalControlEl.textContent = `/ ${this.totalTracks}`;
        if (trackNameControlEl) trackNameControlEl.textContent = track.title;
        
        // Update background image
        const backgroundImage = document.getElementById('backgroundImage');
        backgroundImage.style.backgroundImage = `url('${track.image}')`;
        
        // Update content without animations first
        this.updateTrackContent(track.content, false);
        
        // Start animations only if loading is complete and requested
        if (startAnimations && this.isLoadingComplete) {
            this.startTrackAnimations(track.content);
        }
        
        // Load Spotify embed
        this.loadSpotifyEmbed(track.spotifyKey);
        
        // Update navigation
        this.updateNavigationDots();
        
        // Reset animations
        this.resetAnimations();
        
        // Scroll to top
        const contentOverlay = document.querySelector('.content-overlay');
        contentOverlay.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1500);
    }
    
    loadSpotifyEmbed(spotifyKey) {
        const spotifyContent = document.getElementById('spotifyContent');
        
        if (this.spotifyData && this.spotifyData[spotifyKey]) {
            const embedCode = this.spotifyData[spotifyKey].spotify_embed_code;
            spotifyContent.innerHTML = embedCode;
        } else {
            spotifyContent.innerHTML = '<p style="color: rgba(255,255,255,0.7); text-align: center; padding: 1rem;">Spotify bulunamadı</p>';
        }
    }
    
    setupAudio(audioSrc) {
        // Stop current audio
        this.stopCurrentAudio();
        
        // Setup new audio
        this.audio = document.getElementById('trackAudio');
        this.audio.src = audioSrc;
        this.audio.volume = 0.5;
        
        // Audio event listeners
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateTimeDisplay();
        });
        
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
            this.updateTimeDisplay();
        });
        
        this.audio.addEventListener('ended', () => {
            this.nextTrack();
        });
        
        this.audio.addEventListener('canplay', () => {
            console.log(`Audio ready: ${audioSrc}`);
        });
    }
    
    goToTrack(trackNumber) {
        if (trackNumber === this.currentTrack || this.isTransitioning) return;
        if (trackNumber < 1 || trackNumber > this.totalTracks) return;
        
        this.currentTrack = trackNumber;
        this.loadTrack(trackNumber, true); // Start animations when changing tracks
    }
    
    nextTrack() {
        const nextTrackNumber = this.currentTrack < this.totalTracks ? this.currentTrack + 1 : 1;
        this.goToTrack(nextTrackNumber);
    }
    
    previousTrack() {
        const prevTrackNumber = this.currentTrack > 1 ? this.currentTrack - 1 : this.totalTracks;
        this.goToTrack(prevTrackNumber);
    }
    
    updateNavigationDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index + 1 === this.currentTrack);
        });
    }
    
    resetAnimations() {
        // Reset all animations by removing and re-adding animation classes
        const animatedElements = document.querySelectorAll('.paragraph, .verse');
        animatedElements.forEach(element => {
            element.style.animation = 'none';
            element.offsetHeight; // Trigger reflow
            element.style.animation = null;
        });
    }
    
    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousTrack();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextTrack();
                break;
        }
    }
    
    adjustVolume(change) {
        // Not needed anymore since we use Spotify
        console.log('Volume control handled by Spotify player');
    }
    
    setupTouchControls() {
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextTrack();
                } else {
                    this.previousTrack();
                }
            }
            
            startX = 0;
            startY = 0;
        });
    }
}

// Track Data Loader - This can be extended to load from external JSON or markdown
class TrackDataLoader {
    static async loadFromMarkdown(markdownFile) {
        try {
            const response = await fetch(markdownFile);
            const text = await response.text();
            return this.parseMarkdown(text);
        } catch (error) {
            console.error('Error loading markdown:', error);
            return {};
        }
    }
    
    static parseMarkdown(text) {
        const tracks = {};
        const sections = text.split(/^# /m).filter(section => section.trim());
        
        sections.forEach((section, index) => {
            const lines = section.split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            
            const paragraphs = [];
            const verses = [];
            
            // Parse content (this is a basic parser, can be enhanced)
            const contentLines = content.split('\n').filter(line => line.trim());
            let inPoem = false;
            
            contentLines.forEach(line => {
                if (line.length < 50 && !line.includes('.')) {
                    verses.push(line.trim());
                } else if (line.includes('.')) {
                    paragraphs.push(line.trim());
                }
            });
            
            tracks[index + 1] = {
                title: title,
                image: `assets/img/${(index + 1).toString().padStart(2, '0')}.jpg`,
                audio: `assets/music/${(index + 1).toString().padStart(2, '0')} ${title}.m4a`,
                content: { paragraphs, verses }
            };
        });
        
        return tracks;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Add visual feedback for interactions
    const addVisualFeedback = () => {
        const buttons = document.querySelectorAll('button, .dot');
        buttons.forEach(button => {
            button.addEventListener('mousedown', () => {
                button.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('mouseup', () => {
                button.style.transform = '';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    };
    
    // Initialize album player
    const albumPlayer = new DynamicAlbumPlayer();
    
    // Add visual feedback
    addVisualFeedback();
    
    // Initialize Spotify toggle functionality
    initializeSpotifyToggle();
    
    console.log('Dynamic Album Player initialized successfully');
    
    // Optional: Load tracks from external markdown file
    // const externalTracks = await TrackDataLoader.loadFromMarkdown('texts.md');
    // if (Object.keys(externalTracks).length > 0) {
    //     albumPlayer.tracks = externalTracks;
    //     albumPlayer.totalTracks = Object.keys(externalTracks).length;
    //     albumPlayer.generateNavigationDots();
    // }
});

// Initialize Spotify toggle functionality
function initializeSpotifyToggle() {
    const spotifyWidget = document.getElementById('spotifyWidget');
    const spotifyToggle = document.getElementById('spotifyToggle');
    
    if (spotifyToggle) {
        spotifyToggle.addEventListener('click', () => {
            spotifyWidget.classList.toggle('collapsed');
            spotifyToggle.textContent = spotifyWidget.classList.contains('collapsed') ? '+' : '−';
        });
    }
}
