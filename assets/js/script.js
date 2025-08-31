// Dynamic Album Player System with Audio Integration
class DynamicAlbumPlayer {
    constructor() {
        this.currentTrack = 1;
        this.totalTracks = 11;
        this.isTransitioning = false;
        this.audioData = null;
        this.isLoadingComplete = false;
        this.audioPlayer = null;
        this.isPlaying = false;
        this.hasUserInteracted = false; // Track user interaction for autoplay
        this.preloadedAudios = {}; // Store preloaded audio elements
        this.lastPlayPauseTime = 0; // Prevent rapid play/pause triggers
        this.isSeeking = false; // Flag to prevent timeupdate interference during seeking
        
        // Track data from markdown
        this.tracks = this.loadTracksFromMarkdown();
        
        this.init();
    }

    async init() {
        this.showLoadingScreen();
        await this.loadAudioData();
        await this.preloadAllAudios(); // Preload all audio files during loading
        this.setupAudioPlayer();
        this.generateNavigationDots();
        this.setupEventListeners();
        this.setupTitlePage();
        this.loadTrack(this.currentTrack, false);
        await this.loadAudioForTrack(this.currentTrack); // Load audio for initial track after preload
        
        // Hide loading screen and show title page after all audio is loaded
        this.hideLoadingScreen();
        this.showTitlePage();
        this.isLoadingComplete = true;
    }
    
    async loadAudioData() {
        try {
            const response = await fetch('links.json');
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            console.log('Response text:', text);
            
            this.audioData = JSON.parse(text);
            console.log('Audio data loaded successfully:', this.audioData);
        } catch (error) {
            console.error('Error loading audio data:', error);
        }
    }

    async preloadAllAudios() {
        if (!this.audioData) return;
        
        // Clear any existing preloaded audios first
        this.preloadedAudios = {};
        
        console.log('Starting to preload all audio files...');
        this.updateLoadingText('Şarkılar yükleniyor...');
        
        const totalTracks = Object.keys(this.audioData.tracks).length;
        let loadedCount = 0;
        
        // Load all tracks sequentially to ensure they're fully loaded
        for (let trackNum = 1; trackNum <= this.totalTracks; trackNum++) {
            const audioPath = this.audioData.tracks[trackNum.toString()];
            if (audioPath) {
                console.log(`Loading track ${trackNum}: ${audioPath}`);
                
                try {
                    await new Promise((resolve, reject) => {
                        const audio = new Audio();
                        audio.preload = 'auto'; // Load everything at once
                        audio.crossOrigin = 'anonymous';
                        
                        let isComplete = false;
                        
                        const complete = () => {
                            if (!isComplete) {
                                isComplete = true;
                                this.preloadedAudios[trackNum] = audio;
                                loadedCount++;
                                const percentage = Math.round((loadedCount / totalTracks) * 100);
                                this.updateLoadingText(`Şarkılar yükleniyor... ${percentage}%`);
                                
                                // Duration logging için iyileştirme
                                let durationText = 'Unknown';
                                if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
                                    durationText = `${audio.duration.toFixed(2)}s`;
                                } else if (audio.buffered.length > 0) {
                                    const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
                                    if (bufferedEnd && !isNaN(bufferedEnd) && isFinite(bufferedEnd)) {
                                        durationText = `~${bufferedEnd.toFixed(2)}s (from buffer)`;
                                    }
                                } else {
                                    durationText = 'Will detect during playback';
                                }
                                
                                console.log(`✓ Track ${trackNum} loaded (duration: ${durationText}, ${percentage}%)`);
                                resolve();
                            }
                        };
                        
                        // Wait for the audio to be fully loaded with metadata
                        audio.addEventListener('canplaythrough', () => {
                            console.log(`✓ Track ${trackNum} can play through, duration: ${audio.duration}s`);
                            complete();
                        });
                        
                        audio.addEventListener('loadedmetadata', () => {
                            console.log(`✓ Track ${trackNum} metadata loaded, duration: ${audio.duration}s, readyState: ${audio.readyState}`);
                        });
                        
                        audio.addEventListener('loadstart', () => {
                            console.log(`🔄 Track ${trackNum} load started`);
                        });
                        
                        audio.addEventListener('progress', (e) => {
                            console.log(`⏳ Track ${trackNum} loading progress, readyState: ${audio.readyState}`);
                        });
                        
                        audio.addEventListener('error', (e) => {
                            if (!isComplete) {
                                console.error(`✗ Failed to load track ${trackNum}:`, e);
                                console.error(`Audio error details:`, {
                                    error: audio.error,
                                    networkState: audio.networkState,
                                    readyState: audio.readyState,
                                    src: audio.src
                                });
                                reject(e);
                            }
                        });
                        
                        // Set timeout for tracks that might not load
                        setTimeout(() => {
                            if (!isComplete) {
                                console.warn(`⚠ Track ${trackNum} loading timeout, continuing...`);
                                complete();
                            }
                        }, 20000); // 20 second timeout per track
                        
                        audio.src = audioPath;
                        audio.load();
                    });
                } catch (error) {
                    console.error(`Failed to load track ${trackNum}, continuing...`, error);
                    loadedCount++;
                }
            }
        }
        
        console.log('All audio files preloaded successfully!');
        this.updateLoadingText('Tüm şarkılar hazır!');
        
        // Wait a moment to show completion message
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    updateLoadingText(text) {
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

        setupAudioPlayer() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.currentTimeDisplay = document.getElementById('currentTime');
        this.durationDisplay = document.getElementById('duration');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeBtn = document.getElementById('volumeBtn');
        
        this.setupAudioEventListeners();
    }
    
    setupAudioEventListeners() {
        // Remove old listeners if they exist
        if (this.audioPlayer) {
            // Audio player UI event listeners
            this.playPauseBtn.removeEventListener('click', this.playPauseHandler);
            this.progressBar.removeEventListener('click', this.progressBarHandler);
            this.volumeSlider.removeEventListener('input', this.volumeHandler);
            this.volumeBtn.removeEventListener('click', this.muteHandler);
            
            // Audio element event listeners
            this.audioPlayer.removeEventListener('loadedmetadata', this.metadataHandler);
            this.audioPlayer.removeEventListener('timeupdate', this.timeupdateHandler);
            this.audioPlayer.removeEventListener('ended', this.endedHandler);
            this.audioPlayer.removeEventListener('error', this.errorHandler);
            this.audioPlayer.removeEventListener('play', this.playHandler);
            this.audioPlayer.removeEventListener('durationchange', this.durationChangeHandler);
        }
        
        // Create bound handlers
        this.playPauseHandler = () => {
            this.hasUserInteracted = true; // Enable autoplay
            this.togglePlayPause();
        };
        this.progressBarHandler = (e) => this.seekAudio(e);
        this.volumeHandler = () => this.setVolume();
        this.muteHandler = () => this.toggleMute();
        this.metadataHandler = () => this.updateDuration();
        this.timeupdateHandler = () => this.updateProgress();
        this.endedHandler = () => this.nextTrack();
        this.errorHandler = (e) => {
            console.error('Audio error:', e);
            console.log('Current audio source:', this.audioPlayer.src);
        };
        this.playHandler = () => {
            // Duration detection when play starts (for Opus files)
            if (!this.audioPlayer.duration || !isFinite(this.audioPlayer.duration)) {
                console.log('Attempting duration detection on play...');
                setTimeout(() => this.updateDuration(), 100);
            }
        };
        this.durationChangeHandler = () => {
            console.log('Duration changed:', this.audioPlayer.duration);
            this.updateDuration();
        };
        
        // Add event listeners
        this.playPauseBtn.addEventListener('click', this.playPauseHandler);
        this.progressBar.addEventListener('click', this.progressBarHandler);
        this.volumeSlider.addEventListener('input', this.volumeHandler);
        this.volumeBtn.addEventListener('click', this.muteHandler);
        
        // Audio element event listeners
        this.audioPlayer.addEventListener('loadedmetadata', this.metadataHandler);
        this.audioPlayer.addEventListener('timeupdate', this.timeupdateHandler);
        this.audioPlayer.addEventListener('ended', this.endedHandler);
        this.audioPlayer.addEventListener('error', this.errorHandler);
        this.audioPlayer.addEventListener('play', this.playHandler);
        this.audioPlayer.addEventListener('durationchange', this.durationChangeHandler);
        this.audioPlayer.addEventListener('seeked', () => {
            console.log('Seek completed, currentTime:', this.audioPlayer.currentTime);
            this.isSeeking = false; // Clear seeking flag when seek is complete
            this.updateProgress(); // Update progress after seek
        });
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
            this.hasUserInteracted = true; // Enable autoplay
            this.hideTitlePage();
            
            // Start playing the first track immediately
            setTimeout(() => {
                if (this.audioPlayer && this.audioPlayer.src) {
                    this.audioPlayer.play().then(() => {
                        this.isPlaying = true;
                        this.updatePlayPauseButton();
                    }).catch(error => {
                        console.log('Failed to start playing:', error);
                    });
                }
            }, 1000); // Wait for title page transition
        });

        // Credits popup modal event
        const creditsToggle = document.getElementById('creditsToggle');
        const creditsPopup = document.getElementById('creditsPopup');
        const creditsClose = document.getElementById('creditsClose');
        const creditsOverlay = document.querySelector('.credits-popup-overlay');
        
        creditsToggle.addEventListener('click', () => {
            creditsPopup.classList.add('active');
        });
        
        creditsClose.addEventListener('click', () => {
            creditsPopup.classList.remove('active');
        });
        
        creditsOverlay.addEventListener('click', () => {
            creditsPopup.classList.remove('active');
        });
        
        // Close popup with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && creditsPopup.classList.contains('active')) {
                creditsPopup.classList.remove('active');
            }
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
            dot.addEventListener('click', () => {
                this.hasUserInteracted = true;
                this.goToTrack(i);
            });
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
        // Track user interaction for autoplay
        const trackInteraction = () => {
            this.hasUserInteracted = true;
            document.removeEventListener('click', trackInteraction);
            document.removeEventListener('keydown', trackInteraction);
            document.removeEventListener('touchstart', trackInteraction);
        };
        
        document.addEventListener('click', trackInteraction);
        document.addEventListener('keydown', trackInteraction);
        document.addEventListener('touchstart', trackInteraction);
        
        // Screen tap to play/pause (avoid conflicts with UI elements and scrolling)
        this.setupScreenTapPlayPause();
        
        // Navigation dots (will be generated dynamically)
        
        // Navigation arrows
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        prevBtn.addEventListener('click', () => {
            this.hasUserInteracted = true;
            this.previousTrack();
        });
        nextBtn.addEventListener('click', () => {
            this.hasUserInteracted = true;
            this.nextTrack();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Touch/Swipe controls
        this.setupTouchControls();
        
        // Audio player visibility controls
        this.setupAudioPlayerVisibility();
    }
    
    setupScreenTapPlayPause() {
        let touchStartY = 0;
        let touchStartTime = 0;
        let hasMoved = false;
        
        // Helper function to check if element should be ignored for tap
        const shouldIgnoreTap = (target) => {
            // Ignore clicks on interactive elements
            const ignoredElements = [
                '.navigation-dots', '.navigation-dot', '.dot', '#navDots', '#prevBtn', '#nextBtn',
                '.audio-player-widget', '#playPauseBtn', '#progressBar', '#volumeSlider',
                '.title-page', '.start-btn', 'button', 'input', 'a', '[role="button"]'
            ];
            
            return ignoredElements.some(selector => {
                return target.closest(selector) !== null;
            });
        };
        
        // Helper function to check cooldown period
        const canTriggerPlayPause = () => {
            const now = Date.now();
            const timeSinceLastTrigger = now - this.lastPlayPauseTime;
            return timeSinceLastTrigger > 1000; // 1 second cooldown
        };
        
        // Helper function to trigger play/pause with cooldown
        const triggerPlayPause = () => {
            if (!canTriggerPlayPause()) {
                console.log('Play/pause blocked - cooldown active');
                return;
            }
            
            this.lastPlayPauseTime = Date.now();
            this.hasUserInteracted = true;
            this.togglePlayPause();
            this.showPlayPauseIndicator();
        };
        
        // Handle mouse clicks (desktop)
        document.addEventListener('click', (e) => {
            if (!this.isLoadingComplete || shouldIgnoreTap(e.target)) return;
            triggerPlayPause();
        });
        
        // Handle touch events (mobile) - avoid conflicts with scrolling
        document.addEventListener('touchstart', (e) => {
            if (!this.isLoadingComplete || shouldIgnoreTap(e.target)) return;
            
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            hasMoved = false;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.isLoadingComplete) return;
            
            const currentY = e.touches[0].clientY;
            const diffY = Math.abs(currentY - touchStartY);
            
            // If moved more than 10px, consider it a scroll
            if (diffY > 10) {
                hasMoved = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!this.isLoadingComplete || shouldIgnoreTap(e.target)) return;
            
            const touchDuration = Date.now() - touchStartTime;
            
            // Only trigger play/pause if:
            // 1. Touch was short (< 200ms)
            // 2. Didn't move much (not a scroll)
            if (touchDuration < 200 && !hasMoved) {
                triggerPlayPause();
            }
        }, { passive: true });
    }
    
    showPlayPauseIndicator() {
        // Create or get existing indicator
        let indicator = document.getElementById('playPauseIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'playPauseIndicator';
            indicator.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px;
                border-radius: 50%;
                font-size: 24px;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            document.body.appendChild(indicator);
        }
        
        // Update icon based on play state
        indicator.textContent = this.isPlaying ? '⏸️' : '▶️';
        
        // Show and hide with animation
        indicator.style.opacity = '1';
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 1000); // Show for 1 second (same as cooldown)
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
        
        // Load audio if available
        this.loadAudioForTrack(trackNumber);
        
        // Update background image
        const backgroundImage = document.getElementById('backgroundImage');
        backgroundImage.style.backgroundImage = `url('${track.image}')`;
        
        // Update content without animations first
        this.updateTrackContent(track.content, false);
        
        // Start animations only if loading is complete and requested
        if (startAnimations && this.isLoadingComplete) {
            this.startTrackAnimations(track.content);
        }
        
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
        this.loadAudioForTrack(trackNumber); // Load audio for the new track
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

    // Audio Player Methods - Optimized for Opus files
    async loadAudioForTrack(trackNumber) {
        if (this.preloadedAudios[trackNumber]) {
            // Replace the current audio player with preloaded one
            const preloadedAudio = this.preloadedAudios[trackNumber];
            
            // Remove old event listeners from current audio player
            if (this.audioPlayer) {
                this.audioPlayer.pause();
                this.audioPlayer.currentTime = 0;
            }
            
            // Replace the audio player reference
            this.audioPlayer = preloadedAudio;
            
            // Re-setup event listeners for the new audio element
            this.setupAudioEventListeners();
            
            // Update duration and time displays immediately since metadata is already loaded
            let durationText = 'Unknown';
            if (this.audioPlayer.duration && !isNaN(this.audioPlayer.duration) && isFinite(this.audioPlayer.duration)) {
                durationText = `${this.audioPlayer.duration.toFixed(2)}s`;
            } else if (this.audioPlayer.buffered.length > 0) {
                const bufferedEnd = this.audioPlayer.buffered.end(this.audioPlayer.buffered.length - 1);
                if (bufferedEnd && !isNaN(bufferedEnd) && isFinite(bufferedEnd)) {
                    durationText = `~${bufferedEnd.toFixed(2)}s (from buffer)`;
                }
            } else {
                durationText = 'Will detect during playback';
            }
            console.log(`✓ Using preloaded audio for track ${trackNumber}, duration: ${durationText}`);
            
            // Force update duration and progress immediately
            this.updateDuration();
            this.updateProgress();
            
            // Reset to beginning
            this.audioPlayer.currentTime = 0;
            
            // Auto-play after loading (with user interaction check)
            if (this.hasUserInteracted) {
                this.audioPlayer.play().then(() => {
                    this.isPlaying = true;
                    this.updatePlayPauseButton();
                }).catch(error => {
                    console.log('Auto-play prevented:', error);
                    this.isPlaying = false;
                    this.updatePlayPauseButton();
                });
            } else {
                // Reset play state when loading new track
                this.isPlaying = false;
                this.updatePlayPauseButton();
            }
        } else if (this.audioData && this.audioData.tracks[trackNumber]) {
            // Fallback to old method if preload failed
            const audioUrl = this.audioData.tracks[trackNumber];
            
            this.audioPlayer.src = audioUrl;
            this.audioPlayer.load();
            
            // Wait for audio to be ready
            const waitForReady = () => {
                return new Promise((resolve) => {
                    if (this.audioPlayer.readyState >= 2) { // HAVE_CURRENT_DATA
                        resolve();
                    } else {
                        this.audioPlayer.addEventListener('canplay', resolve, { once: true });
                    }
                });
            };
            
            await waitForReady();
            
            // Auto-play after loading (with user interaction check)
            if (this.hasUserInteracted) {
                this.audioPlayer.play().then(() => {
                    this.isPlaying = true;
                    this.updatePlayPauseButton();
                }).catch(error => {
                    console.log('Auto-play prevented:', error);
                    this.isPlaying = false;
                    this.updatePlayPauseButton();
                });
            } else {
                // Reset play state when loading new track
                this.isPlaying = false;
                this.updatePlayPauseButton();
            }
        }
    }

    togglePlayPause() {
        if (this.audioPlayer.paused) {
            this.audioPlayer.play().then(() => {
                this.isPlaying = true;
                this.updatePlayPauseButton();
            });
        } else {
            this.audioPlayer.pause();
            this.isPlaying = false;
            this.updatePlayPauseButton();
        }
    }

    updatePlayPauseButton() {
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');
        
        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    seekAudio(e) {
        console.log('Seek triggered, event:', e);
        console.log('Audio duration:', this.audioPlayer.duration);
        console.log('Audio readyState:', this.audioPlayer.readyState);
        
        // Ensure audio is loaded and has valid finite duration
        if (!this.audioPlayer.duration || isNaN(this.audioPlayer.duration) || !isFinite(this.audioPlayer.duration)) {
            console.log('Cannot seek: invalid duration:', this.audioPlayer.duration);
            return;
        }
        
        const rect = this.progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * this.audioPlayer.duration;
        
        console.log('Click position:', pos, 'New time:', newTime);
        
        // Ensure the new time is within bounds and finite
        if (newTime >= 0 && newTime <= this.audioPlayer.duration && isFinite(newTime)) {
            // Pause before seeking for better reliability
            const wasPlaying = !this.audioPlayer.paused;
            console.log('Was playing:', wasPlaying, 'Setting currentTime to:', newTime);
            
            // Temporarily flag that we're seeking to prevent timeupdate interference
            this.isSeeking = true;
            
            try {
                this.audioPlayer.currentTime = newTime;
                console.log('currentTime set successfully to:', this.audioPlayer.currentTime);
                
                // Update progress immediately
                this.updateProgress();
                
                // Resume playing if it was playing before
                if (wasPlaying) {
                    setTimeout(() => {
                        this.audioPlayer.play().catch(err => console.log('Play error:', err));
                    }, 100);
                }
            } catch (error) {
                console.error('Error setting currentTime:', error);
            }
            
            // Clear seeking flag after a short delay
            setTimeout(() => {
                this.isSeeking = false;
            }, 200);
            
        } else {
            console.log('Cannot seek: invalid time:', newTime);
        }
    }

    updateProgress() {
        // Skip update if we're currently seeking to prevent interference
        if (this.isSeeking) return;
        
        if (this.audioPlayer && this.audioPlayer.duration && !isNaN(this.audioPlayer.duration) && isFinite(this.audioPlayer.duration)) {
            const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            this.progressFill.style.width = progress + '%';
            
            this.currentTimeDisplay.textContent = this.formatTime(this.audioPlayer.currentTime);
        } else {
            this.progressFill.style.width = '0%';
            this.currentTimeDisplay.textContent = '0:00';
        }
    }

    updateDuration() {
        if (this.audioPlayer) {
            // Opus dosyaları için duration detection iyileştirmesi
            let duration = this.audioPlayer.duration;
            
            // Duration infinity veya invalid ise farklı yöntemler dene
            if (!duration || isNaN(duration) || !isFinite(duration)) {
                // Alternatif duration detection
                if (this.audioPlayer.buffered.length > 0) {
                    duration = this.audioPlayer.buffered.end(this.audioPlayer.buffered.length - 1);
                }
            }
            
            // Hala geçerli bir duration yoksa
            if (duration && !isNaN(duration) && isFinite(duration) && duration > 0) {
                this.durationDisplay.textContent = this.formatTime(duration);
            } else {
                this.durationDisplay.textContent = '--:--';
                console.log('Duration still not available, will retry during playback');
                
                // Duration olmasa bile audio element'i dinlemeye devam et
                if (this.audioPlayer) {
                    // Playback sırasında duration gelirse güncelle
                    const durationUpdateHandler = () => {
                        if (this.audioPlayer.duration && !isNaN(this.audioPlayer.duration) && isFinite(this.audioPlayer.duration)) {
                            this.durationDisplay.textContent = this.formatTime(this.audioPlayer.duration);
                            this.audioPlayer.removeEventListener('timeupdate', durationUpdateHandler);
                            console.log('Duration detected during playback:', this.audioPlayer.duration);
                        }
                    };
                    this.audioPlayer.addEventListener('timeupdate', durationUpdateHandler);
                }
            }
        } else {
            this.durationDisplay.textContent = '--:--';
        }
    }

    setVolume() {
        this.audioPlayer.volume = this.volumeSlider.value / 100;
        this.updateVolumeButton();
    }

    toggleMute() {
        if (this.audioPlayer.volume > 0) {
            this.audioPlayer.volume = 0;
            this.volumeSlider.value = 0;
        } else {
            this.audioPlayer.volume = 0.7;
            this.volumeSlider.value = 70;
        }
        this.updateVolumeButton();
    }

    updateVolumeButton() {
        const volume = this.audioPlayer.volume;
        if (volume === 0) {
            this.volumeBtn.textContent = '🔇';
        } else if (volume < 0.5) {
            this.volumeBtn.textContent = '🔉';
        } else {
            this.volumeBtn.textContent = '🔊';
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    setupAudioPlayerVisibility() {
        const audioWidget = document.getElementById('audioPlayerWidget');
        let hideTimeout;
        let isDragging = false;
        let startY = 0;
        let currentY = 0;
        
        // Initially show the widget, then hide after delay
        audioWidget.classList.add('visible');
        
        // Desktop: Hide on mouse leave, show on hover with larger detection area
        const showWidget = () => {
            clearTimeout(hideTimeout);
            audioWidget.classList.add('visible');
        };
        
        const hideWidget = () => {
            hideTimeout = setTimeout(() => {
                if (!isDragging) {
                    audioWidget.classList.remove('visible');
                }
            }, 2000); // 2 second delay
        };
        
        // Hover detection for bottom area of screen
        document.addEventListener('mousemove', (e) => {
            const windowHeight = window.innerHeight;
            const mouseY = e.clientY;
            
            // Show widget when mouse is in bottom 150px of screen
            if (mouseY > windowHeight - 150) {
                showWidget();
            } else if (mouseY < windowHeight - 200) {
                // Hide only if mouse is well away from bottom
                if (audioWidget.classList.contains('visible')) {
                    hideWidget();
                }
            }
        });
        
        audioWidget.addEventListener('mouseenter', showWidget);
        audioWidget.addEventListener('mouseleave', hideWidget);
        
        // Mobile: Drag to show/hide
        audioWidget.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
            audioWidget.style.transition = 'none';
            clearTimeout(hideTimeout);
        });
        
        audioWidget.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            // Only allow downward dragging when visible, upward when hidden
            if (audioWidget.classList.contains('visible') && deltaY > 0) {
                const translateY = Math.min(deltaY, 200);
                audioWidget.style.transform = `translateY(${translateY}px)`;
            } else if (!audioWidget.classList.contains('visible') && deltaY < 0) {
                const translateY = Math.max(deltaY, -200);
                audioWidget.style.transform = `translateY(calc(100% - 20px + ${translateY}px))`;
            }
        });
        
        audioWidget.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const deltaY = currentY - startY;
            audioWidget.style.transition = '';
            audioWidget.style.transform = '';
            
            // Threshold for showing/hiding (80px)
            if (Math.abs(deltaY) > 80) {
                if (deltaY > 0 && audioWidget.classList.contains('visible')) {
                    // Dragged down - hide
                    audioWidget.classList.remove('visible');
                } else if (deltaY < 0 && !audioWidget.classList.contains('visible')) {
                    // Dragged up - show
                    audioWidget.classList.add('visible');
                }
            }
            
            isDragging = false;
            startY = 0;
            currentY = 0;
        });
        
        // Auto-hide after initial display
        setTimeout(() => {
            if (!audioWidget.matches(':hover')) {
                audioWidget.classList.remove('visible');
            }
        }, 5000); // Hide after 5 seconds initially
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


