function toggleBookmark(paragraphIndex) {
    const paragraph = document.getElementById(`paragraph-${paragraphIndex}`);
    const content = paragraph.querySelector('p').innerText;

    // Get the current page dynamically from pagination logic
    const currentPage = getCurrentPage(); // This will be defined in your pagination logic

    // Check if the paragraph is already bookmarked
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    const isAlreadyBookmarked = savedBookmarks.some(b => b.id === `paragraph-${paragraphIndex}`);

    if (isAlreadyBookmarked) {
        alert('This paragraph is already bookmarked.');
        return;  // Exit the function if the paragraph is already bookmarked
    }

    // Save the bookmark with the correct page
    addBookmark(paragraphIndex, content, currentPage);

    // Highlight the selected paragraph
    document.querySelectorAll('.paragraph-container').forEach(p => p.classList.remove('selected'));
    paragraph.classList.add('selected');
}


// Toggle the visibility of the bookmark container
document.getElementById('bookmark-button').addEventListener('click', () => {
    const bookmarkContainer = document.getElementById('bookmark-container');
    bookmarkContainer.style.display = bookmarkContainer.style.display === 'none' ? 'block' : 'none';

    // Populate the container with bookmarks
    loadBookmarks();
});

// Close the bookmark container
document.getElementById('close-bookmark-container').addEventListener('click', () => {
    document.getElementById('bookmark-container').style.display = 'none';
});




// Add a new bookmark
function addBookmark(paragraphIndex, content, page) {
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    
    // Check if the user has reached the maximum of 3 bookmarks
    if (savedBookmarks.length >= 1) {
        alert('You already bookmarked, remove the current bookmark to add a new one.');
        return;  // Exit the function if the limit is exceeded
    }

    const bookmark = { id: `paragraph-${paragraphIndex}`, content, page };

    // Check if the bookmark already exists
    if (!savedBookmarks.some(b => b.id === bookmark.id)) {
        savedBookmarks.push(bookmark);
        localStorage.setItem('bookmarks', JSON.stringify(savedBookmarks));
        alert('Bookmark added!');
    } else {
        alert('This paragraph is already bookmarked.');
    }
}


// Load bookmarks into the container
function loadBookmarks() {
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    const bookmarkList = document.getElementById('bookmarked-items');

    // Clear existing bookmarks
    bookmarkList.innerHTML = '';

    if (savedBookmarks.length === 0) {
        const noBookmarksMessage = document.createElement('li');
        noBookmarksMessage.textContent = 'No bookmarks saved.';
        bookmarkList.appendChild(noBookmarksMessage);
    } else {
        // Add each bookmark to the list
        savedBookmarks.forEach((bookmark, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${bookmark.content} (Page: ${bookmark.page})</span>
                <button style="background-color: maroon; color: white; border: none; padding: 10px; width: 15%; font-weight: bold; margin-top: 10px;" onclick="goToBookmark('${bookmark.id}', ${bookmark.page})">Go to Bookmark</button>
                <button style="background-color: maroon; color: white; border: none; padding: 10px; width: 15%; font-weight: bold;" onclick="removeBookmark(${index})">Remove</button>
            `;
            bookmarkList.appendChild(listItem);
        });
    }
}
// Go to the bookmark and page
function goToBookmark(paragraphId, page) {
    // Simulate navigation to the correct page using your pagination logic
    window.location.href = `/lesson/laborlaw${page}`; // Navigate to the page stored in the bookmark

    // Highlight the bookmarked paragraph by adding the 'selected' class
    const bookmarkedElement = document.getElementById(paragraphId);
    if (bookmarkedElement) {
        bookmarkedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Add the 'selected' class to highlight the border
        bookmarkedElement.classList.add('selected');
        
        // Optionally, remove the border highlight from other paragraphs
        document.querySelectorAll('.paragraph-container').forEach(p => {
            if (p !== bookmarkedElement) {
                p.classList.remove('selected');
            }
        });
    } else {
        alert('Bookmarked paragraph not found.');
    }

    // Close the bookmark container after going to the bookmark
    const bookmarkContainer = document.getElementById('bookmark-container');
    if (bookmarkContainer) {
        bookmarkContainer.style.display = 'none'; // Hide the bookmark container
    }
}


// Remove a bookmark from localStorage
function removeBookmark(bookmarkIndex) {
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

    // Remove the bookmark from the array
    savedBookmarks.splice(bookmarkIndex, 1);

    // Update the bookmarks in localStorage
    localStorage.setItem('bookmarks', JSON.stringify(savedBookmarks));

    // Reload the bookmarks to update the UI
    loadBookmarks();
}


document.addEventListener('DOMContentLoaded', () => {
    const bookmarkContainer = document.getElementById('bookmark-container');
    const bookmarkButton = document.getElementById('bookmark-button');

    // Load bookmarks
    loadBookmarks();

    // Show bookmark container when clicking on the bookmark button
    bookmarkButton.addEventListener('click', () => {
        bookmarkContainer.style.display = 'block';
    });

    // Close the bookmark container
    document.getElementById('close-bookmark-container').addEventListener('click', () => {
        bookmarkContainer.style.display = 'none';
    });
});






    let speechSynthesisUtterance = null; // Global reference for the current utterance
    let voices = [];
    let isPaused = false;
    let wordList = [];
    let currentWordIndex = 0;

    // Load available voices
    function loadVoices() {
        voices = window.speechSynthesis.getVoices();
        const voiceSelect = document.getElementById('voiceSelect');
        voiceSelect.innerHTML = ''; // Clear existing options
        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = voice.name + (voice.default ? " (default)" : "");
            voiceSelect.appendChild(option);
        });
    }

    // Initialize word list
    function initializeWordList() {
        wordList = [];
        const paragraphs = document.querySelectorAll('.paragraph-container p');
        paragraphs.forEach(paragraph => {
            const words = paragraph.querySelectorAll('.word');
            words.forEach(word => {
                wordList.push(word);
            });
        });
    }

    // Read text with speech synthesis and highlight words
    function readText() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel(); // Stop ongoing speech before starting new
        }

        initializeWordList(); // Initialize word list
        currentWordIndex = 0; // Reset word index

        const selectedVoiceIndex = document.getElementById('voiceSelect').value;
        const selectedVoice = voices[selectedVoiceIndex];
        const textToRead = wordList.map(word => word.textContent).join(' ');

        speechSynthesisUtterance = new SpeechSynthesisUtterance(textToRead);
        speechSynthesisUtterance.voice = selectedVoice;

        // Handle word boundary events
        speechSynthesisUtterance.onboundary = (event) => {
            if (event.name === 'word') {
                // Calculate the word index based on character index
                const charIndex = event.charIndex;
                const spokenText = textToRead.substring(0, charIndex);
                const wordsSpoken = spokenText.trim().split(/\s+/).length;
                highlightWord(wordsSpoken - 1);
            }
        };

        speechSynthesisUtterance.onend = () => {
            removeHighlight(currentWordIndex);
            document.getElementById('pauseBtn').disabled = true;
            document.getElementById('stopBtn').disabled = true;
            document.getElementById('readBtn').disabled = false;
        };

        speechSynthesis.speak(speechSynthesisUtterance);
        document.getElementById('readBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('stopBtn').disabled = false;
    }

    // Highlight the current word
    function highlightWord(index) {
        // Remove existing highlights
        wordList.forEach(word => word.classList.remove('highlight'));

        if (index >= 0 && index < wordList.length) {
            wordList[index].classList.add('highlight');
            currentWordIndex = index;
            // Scroll into view if needed
            wordList[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Remove highlight from a specific word
    function removeHighlight(index) {
        if (index >= 0 && index < wordList.length) {
            wordList[index].classList.remove('highlight');
        }
    }

    // Pause or resume speech synthesis
    function togglePauseResume() {
        if (!speechSynthesisUtterance || !speechSynthesis.speaking) {
            console.warn("No speech synthesis is active to pause or resume.");
            return;
        }

        if (!isPaused) {
            speechSynthesis.pause();
            document.getElementById('pauseBtn').innerHTML = '<ion-icon name="play"></ion-icon>';
        } else {
            speechSynthesis.resume();
            document.getElementById('pauseBtn').innerHTML = '<ion-icon name="pause"></ion-icon>';
        }
        isPaused = !isPaused;
    }

    // Stop speech synthesis
    function stopSpeech() {
        if (!speechSynthesisUtterance || !speechSynthesis.speaking) {
            console.warn("No speech synthesis is active to stop.");
            return;
        }

        speechSynthesis.cancel();
        if (wordList) {
            wordList.forEach(word => word.classList.remove('highlight'));
        }
        document.getElementById('readBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('pauseBtn').innerHTML = '<ion-icon name="play"></ion-icon>';
        isPaused = false;
    }

    // Stop speech synthesis
    function stopSpeech() {
        if (!speechSynthesisUtterance || !speechSynthesis.speaking) {
            console.warn("No speech synthesis is active to stop.");
            return;
        }

        speechSynthesis.cancel();
        if (wordList) {
            wordList.forEach(word => word.classList.remove('highlight'));
        }
        document.getElementById('readBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('pauseBtn').innerHTML = '<ion-icon name="play"></ion-icon>';
        isPaused = false;
    }

    // Speech recognition commands (updated)
    function initializeSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert("Your browser does not support Speech Recognition.");
            return;
        }

        // Initialize SpeechRecognition
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false; // Single recognition per start
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        let recognizing = false;

        recognition.start();
        recognizing = true;
        document.getElementById('speech-command').innerHTML = '<ion-icon name="mic-off"></ion-icon>';

        // Mic button toggle
        document.getElementById('speech-command').addEventListener('click', () => {
            if (recognizing) {
                recognition.stop();
                recognizing = false;
                document.getElementById('speech-command').innerHTML = '<ion-icon name="mic"></ion-icon>';
            } else {
                recognition.start();
                recognizing = true;
                document.getElementById('speech-command').innerHTML = '<ion-icon name="mic-off"></ion-icon>';
            }
        });

        recognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            console.log("Recognized command:", command);

            // Process command
            handleVoiceCommand(command);

            // Keep listening if mic is active
            if (recognizing) recognition.start();
        };

        recognition.onerror = (event) => {
            console.error("Recognition error:", event.error);
            recognizing = false;
            document.getElementById('speech-command').innerHTML = '<ion-icon name="mic"></ion-icon>';
        };

        recognition.onend = () => {
            if (recognizing) recognition.start(); // Restart recognition
        };
    }

    // Helper function to handle recognized voice commands
    function handleVoiceCommand(command) {
        function speakAndExecute(message, action) {
            const confirmation = new SpeechSynthesisUtterance(message);
            confirmation.onend = action;
            window.speechSynthesis.speak(confirmation);
        }

        if (command.includes("stop")) {
            stopSpeech();
        } else if (command.includes("pause")) {
            togglePauseResume();
        } else if (command.includes("resume")) {
            if (isPaused) {
                togglePauseResume(); // Resume TTS
            } else {
                speakAndExecute("The audio is not paused.", null);
            }
        } else if (command.includes("read")) {
            if (speechSynthesis.speaking) speechSynthesis.cancel(); // Stop current TTS
            readText();
        }

        else if (command.includes("go to page")) {
            const numberMatch = command.match(/\d+/); // Extract the page number

            if (numberMatch) {
                const pageNumber = parseInt(numberMatch[0], 10);

                // Stop TTS immediately if speaking
                if (speechSynthesis.speaking) {
                    speechSynthesis.cancel();
                }

                // Provide feedback and navigate to the specified page
                speakAndExecute(`Navigating to page ${pageNumber}.`, () => {
                    navigateToPage(pageNumber);
                });
            } else {
                // Inform the user that the page number is invalid or missing
                speakAndExecute("Please specify a valid page number.", null);
            }
        }

        else if (command.includes("next page")) {
            const currentPage = extractPageNumber();
            if (currentPage) {
                const nextPage = currentPage + 1;
                if (speechSynthesis.speaking) speechSynthesis.cancel(); // Stop TTS before navigating
                speakAndExecute("Navigating to the next page.", () => navigateToPage(nextPage));
            } else {
                speakAndExecute("Could not determine the next page.", null);
            }
        } else if (command.includes("previous page")) {
            const currentPage = extractPageNumber();
            if (currentPage && currentPage > 1) {
                const previousPage = currentPage - 1;
                if (speechSynthesis.speaking) speechSynthesis.cancel(); // Stop TTS before navigating
                speakAndExecute("Going to the previous page.", () => navigateToPage(previousPage));
            } else {
                speakAndExecute("You are already on the first page.", null);
            }
        } else if (command.includes("go to home")) {
            if (speechSynthesis.speaking) speechSynthesis.cancel(); // Stop TTS before navigating
            speakAndExecute("Returning to home page.", () => window.location.href = '/');
        }

        else if (command.includes("go to paragraph") || command.includes("go to container")) {
            const numberMatch = command.match(/\d+/); // Extract the number from the command
            if (numberMatch) {
                const paragraphIndex = parseInt(numberMatch[0], 10) - 1; // Convert to zero-based index
                const paragraphs = document.querySelectorAll('.paragraph-container');
                if (paragraphIndex >= 0 && paragraphIndex < paragraphs.length) {
                    const targetParagraph = paragraphs[paragraphIndex];

                    // Stop ongoing speech synthesis before navigating
                    if (speechSynthesis.speaking) speechSynthesis.cancel();

                    // Navigate to the target paragraph
                    speakAndExecute(`Navigating to paragraph ${numberMatch[0]}.`, () => {
                        targetParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });

                        // Extract words from the paragraph
                        const words = targetParagraph.querySelectorAll('.word');
                        const textToRead = Array.from(words).map(word => word.textContent).join(' ');

                        // Prepare the speech synthesis utterance
                        speechSynthesisUtterance = new SpeechSynthesisUtterance(textToRead); // Update the global reference
                        speechSynthesisUtterance.voice = voices[document.getElementById('voiceSelect').value];

                        // Highlight words as they are spoken
                        speechSynthesisUtterance.onboundary = (event) => {
                            if (event.name === 'word') {
                                const charIndex = event.charIndex;
                                const spokenText = textToRead.substring(0, charIndex);
                                const wordIndex = spokenText.trim().split(/\s+/).length - 1;

                                // Highlight the current word
                                words.forEach((word, index) => {
                                    word.classList.toggle('highlight', index === wordIndex);
                                });
                            }
                        };

                        // Remove all highlights when finished
                        speechSynthesisUtterance.onend = () => {
                            words.forEach(word => word.classList.remove('highlight'));
                            document.getElementById('pauseBtn').disabled = true;
                            document.getElementById('stopBtn').disabled = true;
                            document.getElementById('readBtn').disabled = false;
                        };

                        // Start reading the paragraph aloud
                        speechSynthesis.speak(speechSynthesisUtterance);
                        document.getElementById('readBtn').disabled = true;
                        document.getElementById('pauseBtn').disabled = false;
                        document.getElementById('stopBtn').disabled = false;
                    });
                } else {
                    speakAndExecute(`Paragraph ${numberMatch[0]} does not exist.`, null);
                }
            } else {
                speakAndExecute("Please specify a valid paragraph or container number.", null);
            }
        }

        else if (command.includes("go to topic")) {
            const topicNames = {
                "introduction": "/lesson/laborlaw1",
                "system of fundamental laws": "/lesson/laborlaw2",
                "types of constitution": "/lesson/laborlaw2",
                "parts of the constitution": "/lesson/laborlaw2",
                "qualities of a written constitution": "/lesson/laborlaw2",
                "doctrine of constitutional supremacy": "/lesson/laborlaw3",
                "interpretation of constitutional provisions": "/lesson/laborlaw3",
                "constitutional construction": "/lesson/laborlaw3",
                "self-executing provisions": "/lesson/laborlaw4",
                "malolos constitution": "/lesson/laborlaw4",
                "1935 constitution": "/lesson/laborlaw5",
                "1943 constitution": "/lesson/laborlaw6",
                "1973 constitution": "/lesson/laborlaw7",
                "1987 constitution": "/lesson/laborlaw8",
                "effectivity of the 1987 constitution": "/lesson/laborlaw8",
                "doctrine of acts of state": "/lesson/laborlaw9",
                "elements of the state": "/lesson/laborlaw9",
                "people or permanent population": "/lesson/laborlaw10",
                "citizens and subjects": "/lesson/laborlaw10",
                "nationality": "/lesson/laborlaw10",
                "definite territory": "/lesson/laborlaw11",
                "terrestrial or land domain": "/lesson/laborlaw11",
                "exemption from territorial jurisdiction": "/lesson/laborlaw11",
                "polar regions": "/lesson/laborlaw12",
                "doctrine of effective occupation": "/lesson/laborlaw12",
                "aerial domain": "/lesson/laborlaw12",
                "jurisdiction over Aerial Domain": "/lesson/laborlaw13",
                "international convention on civil aviation": "/lesson/laborlaw13",
                "five air freedoms": "/lesson/laborlaw13",
                "outer space": "/lesson/laborlaw14",
                "jurisdiction over outer space": "/lesson/laborlaw14",
                "outer space treaty": "/lesson/laborlaw14",
                "convention on registration of launched objects into outer space": "/lesson/laborlaw15",
                "maritime or fluvial domain": "/lesson/laborlaw16",
                "archipelago doctrine": "/lesson/laborlaw16",
                "united nations conventions on the laws of the sea": "/lesson/laborlaw17",
                "internal waters": "/lesson/laborlaw18",
                "straight baseline method": "/lesson/laborlaw18",
                "archipelagic waters": "/lesson/laborlaw18",
                "territorial sea": "/lesson/laborlaw18",
                "right of innocent passage": "/lesson/laborlaw19",
                "contiguous zone": "/lesson/laborlaw20",
                "exclusive economic zone": "/lesson/laborlaw20",
                "jurisdiction over exclusive economic zone": "/lesson/laborlaw20",
                "continental shelf": "/lesson/laborlaw21",
                "jurisdiction over the continental shelf": "/lesson/laborlaw21",
                "international tribunal on the laws of the sea": "/lesson/laborlaw22",
                "philippine baselines laws": "/lesson/laborlaw23",
                "republic act number 5446": "/lesson/laborlaw23",
                "republic act number 9522": "/lesson/laborlaw23",
                "regime of islands": "/lesson/laborlaw23",
                "magallona versus ermita": "/lesson/laborlaw24",
                "kalayaan islands": "/lesson/laborlaw27",
                "scarborough shoal": "/lesson/laborlaw27",
                "republic of the philippines versus people's republic of china": "/lesson/laborlaw28",
                "pca case no. 2013-19": "/lesson/laborlaw28",
                "the sabah issue": "/lesson/laborlaw30",
                "government and form of government": "/lesson/laborlaw31",
                "other forms of government": "/lesson/laborlaw32",
                "estrada vs arroyo": "/lesson/laborlaw33",
                "effect of change in government": "/lesson/laborlaw34",
                "doctrine of parens patriae": "/lesson/laborlaw34",
                "d. sovereignty": "/lesson/laborlaw34",
                "province of north cotabato vs government of the republic of the philippines": "/lesson/laborlaw35",
                "kinds of sovereignty": "/lesson/laborlaw36",
                "is sovereignty absolute": "/lesson/laborlaw36",
                "effect of change in sovereignty": "/lesson/laborlaw36",
                "principle of state continuity": "/lesson/laborlaw37",
                "creation of new state": "/lesson/laborlaw37",
                "extinction of state": "/lesson/laborlaw37",
                "republicanism and renunciation of war": "/lesson/laborlaw38",
                "doctrine of incorporation": "/lesson/laborlaw39",
                "supremacy of civilian authority": "/lesson/laborlaw39",
                "compulsory military service": "/lesson/laborlaw39",
                "national service training program": "/lesson/laborlaw40",
                "separation of church and state": "/lesson/laborlaw40",
                "commemorative stamp commemorating eucharistic congress": "/lesson/laborlaw40",
                "social justice and human rights": "/lesson/laborlaw41",
                "sanctity of the family and human dignity": "/lesson/laborlaw41",
                "republic act no. 10354": "/lesson/laborlaw41",
                "reproductive health law of 2012": "/lesson/laborlaw41",
                "the vital role of youth": "/lesson/laborlaw42",
                "the role of women": "/lesson/laborlaw42",
                "health and ecology": "/lesson/laborlaw43",
                "education": "/lesson/laborlaw44",
                "academic freedom": "/lesson/laborlaw44",
                "protection for labor": "/lesson/laborlaw45",
                "economy controlled by filipinos": "/lesson/laborlaw45",
                "agrarian reform": "/lesson/laborlaw45",
                "regalian doctrine": "/lesson/laborlaw46",
                "the indigenous cultural communities": "/lesson/laborlaw46",
                "communication and information": "/lesson/laborlaw46",
                "local government autonomy": "/lesson/laborlaw47",
                "political dynasty": "/lesson/laborlaw47",
                "honesty and integrity in public service": "/lesson/laborlaw47",
                "policy of public disclosure": "/lesson/laborlaw48",
                "reason for non-suability of the state": "/lesson/laborlaw49",
                "immunity of foreign states and diplomats": "/lesson/laborlaw49",
                "the principle of par in parem non habet imperium": "/lesson/laborlaw50",
                "the vatican is immune from suit": "/lesson/laborlaw50",
                "determination of immunity by the department of foreign affairs": "/lesson/laborlaw50",
                "immunity of international organizations and agencies": "/lesson/laborlaw51",
                "immunity of government agencies": "/lesson/laborlaw51",
                "incorporated government agencies": "/lesson/laborlaw51",
                "unincorporated government agencies": "/lesson/laborlaw52",
                "suits against public officers": "/lesson/laborlaw52",
                "when the suit is deemed against the state": "/lesson/laborlaw53",
                "consent by the state to be sued": "/lesson/laborlaw53",
                "express consent": "/lesson/laborlaw53",
                "implied consent": "/lesson/laborlaw54",
                "when the state commences litigation": "/lesson/laborlaw54",
                "when the state enters into a business contract": "/lesson/laborlaw54",
                "juri imperii": "/lesson/laborlaw55",
                "jure gestionis": "/lesson/laborlaw55",
                "suability not outright liability": "/lesson/laborlaw55",
                "consent to be sued does not include consent to execution": "/lesson/laborlaw56",
                "immunity cannot be used to perpetrate injustice": "/lesson/laborlaw56",
                "immunity from suit cannot be used to institutionalize irresponsibility": "/lesson/laborlaw56",
                "separation of powers": "/lesson/laborlaw57",
                "checks and balances": "/lesson/laborlaw57",
                "delegation of powers": "/lesson/laborlaw58",
                "exceptions to non-delegation rule": "/lesson/laborlaw58",
                "tests for valid delegation": "/lesson/laborlaw58",
                "completeness test": "/lesson/laborlaw59",
                "sufficient standards test": "/lesson/laborlaw59",
                "both tests are required": "/lesson/laborlaw59",
                "extent of the power of congress to delegate": "/lesson/laborlaw60",
                "blending of powers": "/lesson/laborlaw60",
                "legislative power": "/lesson/laborlaw61",
                "congress is a bicameral body": "/lesson/laborlaw61",
                "advantages of bicameral legislature": "/lesson/laborlaw61",
                "disadvantages of bicameral legislature": "/lesson/laborlaw62",
                "the senate": "/lesson/laborlaw62",
                "the house of representatives": "/lesson/laborlaw62",
                "tenure vs. term of office": "/lesson/laborlaw63",
                "residence vs. domicile": "/lesson/laborlaw63",
                "resident for not less than one year": "/lesson/laborlaw63",
                "natural-born citizen": "/lesson/laborlaw64",
                "effects of repatriation": "/lesson/laborlaw64",
                "district representatives and questions of apportionment": "/lesson/laborlaw64",
                "contiguous, compact, and adjacent": "/lesson/laborlaw65",
                "gerrymandering (2014 bar examination question)": "/lesson/laborlaw65",
                "proportional representation based on number of inhabitants": "/lesson/laborlaw65",
                "re-apportionment by congress": "/lesson/laborlaw66",
                "plebiscite is not required": "/lesson/laborlaw66",
                "party-list representatives": "/lesson/laborlaw66",
                "republic act no. 7941": "/lesson/laborlaw67",
                "disqualified sectors": "/lesson/laborlaw67",
                "parameters for the party-list election": "/lesson/laborlaw67",
                "determination of the total number of party-list lawmakers": "/lesson/laborlaw68",
                "the three-seat limitation": "/lesson/laborlaw68",
                "qualifications of party-list nominees": "/lesson/laborlaw68",
                "the 20% allocation is just a ceiling": "/lesson/laborlaw69",
                "the 20% allocation must be filled": "/lesson/laborlaw69",
                "marginalized and underrepresented sector": "/lesson/laborlaw70",
                "new parameters in party-list election": "/lesson/laborlaw70",
                "the names of the party-list nominees shall be published": "/lesson/laborlaw70",
                "privileges of the members of congress": "/lesson/laborlaw71",
                "freedom from arrest": "/lesson/laborlaw71",
                "parliamentary immunity": "/lesson/laborlaw71",
                "speech and debate in congress": "/lesson/laborlaw72",
                "conflict of interest": "/lesson/laborlaw72",
                "incompatible office": "/lesson/laborlaw72",
                "test of incompatibility": "/lesson/laborlaw73",
                "forbidden office": "/lesson/laborlaw73",
                "pnrc chairman is not a government office": "/lesson/laborlaw73",
                "effect of imprisonment": "/lesson/laborlaw74",
                "sessions and quorum": "/lesson/laborlaw74",
                "adjournment": "/lesson/laborlaw75",
                "rules of proceedings": "/lesson/laborlaw75",
                "discipline of members": "/lesson/laborlaw75",
                "legislative journal": "/lesson/laborlaw76",
                "enrolled bill": "/lesson/laborlaw76",
                "recess": "/lesson/laborlaw76",
                "electoral tribunals": "/lesson/laborlaw77",
                "composition": "/lesson/laborlaw77",
                "independence of the electoral tribunal": "/lesson/laborlaw77",
                "powers of the electoral tribunals": "/lesson/laborlaw78",
                "jurisdiction over proclamation controversy": "/lesson/laborlaw78",
                "commission on appointments": "/lesson/laborlaw78",
                "composition (commission on appointments)": "/lesson/laborlaw79",
                "powers and lawmaking power": "/lesson/laborlaw79",
                "limitations on the lawmaking power": "/lesson/laborlaw80",
                "one bill and one subject": "/lesson/laborlaw80",
                "sufficiency of title": "/lesson/laborlaw80",
                "rider clause": "/lesson/laborlaw81",
                "bills that must originate exclusively from the house": "/lesson/laborlaw81",
                "legislative process": "/lesson/laborlaw81",
                "bicameral conference committee": "/lesson/laborlaw82",
                "three readings on separate days": "/lesson/laborlaw82",
                "presidential veto power": "/lesson/laborlaw82",
                "item veto": "/lesson/laborlaw83",
                "pocket veto": "/lesson/laborlaw83",
                "congressional veto": "/lesson/laborlaw83",
                "power of the purse": "/lesson/laborlaw84",
                "implied limitations on appropriation measure": "/lesson/laborlaw84",
                "sub rosa appropriation": "/lesson/laborlaw85",
                "prohibition against transfer of appropriation": "/lesson/laborlaw85",
                "doctrine of inappropriate provisions": "/lesson/laborlaw85",
                "power of taxation": "/lesson/laborlaw86",
                "investigations in aid of legislation": "/lesson/laborlaw86",
                "limitations on legislative investigations": "/lesson/laborlaw86",
                "claim of executive privilege": "/lesson/laborlaw87",
                "question hour": "/lesson/laborlaw87",
                "contempt powers": "/lesson/laborlaw87",
                "imprisonment for legislative contempt": "/lesson/laborlaw88",
                "power to declare existence of state of war": "/lesson/laborlaw88",
                "the prize cases": "/lesson/laborlaw88",
                "initiative and referendum": "/lesson/laborlaw89",
                "initiative to amend the constitution": "/lesson/laborlaw89",
                "resolutions as subjects of initiative": "/lesson/laborlaw90",
                "recall": "/lesson/laborlaw90",
                "executive power": "/lesson/laborlaw91",
                "natural born citizen": "/lesson/laborlaw91",
                "executive powers of the president": "/lesson/laborlaw91",
                "qualifications of the president": "/lesson/laborlaw92",
                "citizenship of a foundling": "/lesson/laborlaw92",
                "residency requirement": "/lesson/laborlaw93",
                "qualifications of the vice president": "/lesson/laborlaw93",
                "election": "/lesson/laborlaw93",
                "election protest of fernando poe, jr.": "/lesson/laborlaw94",
                "term of office": "/lesson/laborlaw94",
                "oath of office": "/lesson/laborlaw94",
                "official residence and salary": "/lesson/laborlaw95",
                "presidential immunity": "/lesson/laborlaw95",
                "immunity of a former president": "/lesson/laborlaw95",
                "prohibited acts": "/lesson/laborlaw96",
                "rules on succession": "/lesson/laborlaw96",
                "vacancy at the beginning of term": "/lesson/laborlaw96",
                "vacancy during the term of office": "/lesson/laborlaw97",
                "vacancy in the office of the vice president": "/lesson/laborlaw97",
                "vacancy in the offices of president and vice president": "/lesson/laborlaw97",
                "constitutional procedure in filling up the vacancy": "/lesson/laborlaw98",
                "removal of the president": "/lesson/laborlaw98",
                "the inability of president estrada": "/lesson/laborlaw98",
                "did president estrada resign?": "/lesson/laborlaw99",
                "legislative powers of the president": "/lesson/laborlaw99",
                "power to prosecute crimes": "/lesson/laborlaw99",
                "power of appointment": "/lesson/laborlaw100",
                "classes of appointment": "/lesson/laborlaw100",
                "appointments to philippine national police": "/lesson/laborlaw100",
                "regular appointment": "/lesson/laborlaw101",
                "ad interim appointment": "/lesson/laborlaw101",
                "termination of an ad interim appointment": "/lesson/laborlaw102",
                "by-passed ad interim appointment": "/lesson/laborlaw102",
                "permanent appointment": "/lesson/laborlaw102",
                "temporary appointment": "/lesson/laborlaw103",
                "acting appointment": "/lesson/laborlaw103",
                "midnight appointment": "/lesson/laborlaw103",
                "midnight appointment prohibition is not applicable in the judiciary": "/lesson/laborlaw104",
                "power of removal": "/lesson/laborlaw104",
                "independence of the ombudsman": "/lesson/laborlaw104",
                "power of control": "/lesson/laborlaw105",
                "control vs. supervision": "/lesson/laborlaw105",
                "alter-ego principle or doctrine of qualified political agency": "/lesson/laborlaw105",
                "power over the local government units": "/lesson/laborlaw106",
                "the executive secretary": "/lesson/laborlaw106",
                "military powers of the president": "/lesson/laborlaw106",
                "commander-in-chief clause": "/lesson/laborlaw107",
                "graduated military powers": "/lesson/laborlaw107",
                "calling out the armed forces": "/lesson/laborlaw107",
                "calling out power is not subject to judicial review": "/lesson/laborlaw108",
                "declaration of martial law": "/lesson/laborlaw108",
                "requisites for the declaration of martial law": "/lesson/laborlaw108",
                "extension of martial law": "/lesson/laborlaw109",
                "suspension of the privilege of the writ of habeas corpus": "/lesson/laborlaw109",
                "pardoning power": "/lesson/laborlaw110",
                "effects of pardon to a public officer": "/lesson/laborlaw110",
                "pardon is forgiveness, not forgetfulness": "/lesson/laborlaw110",
                "kinds of pardon": "/lesson/laborlaw111",
                "limitations on the pardoning power": "/lesson/laborlaw111",
                "amnesty": "/lesson/laborlaw111",
                "pardon vs. amnesty": "/lesson/laborlaw112",
                "reprieve and commutation": "/lesson/laborlaw112",
                "parole": "/lesson/laborlaw112",
                "borrowing power": "/lesson/laborlaw113",
                "diplomatic power": "/lesson/laborlaw113",
                "treaty": "/lesson/laborlaw113",
                "the visiting forces agreement": "/lesson/laborlaw114",
                "executive agreement": "/lesson/laborlaw114",
                "executive agreements need no senate concurrence": "/lesson/laborlaw114",
                "budgetary powers": "/lesson/laborlaw115",
                "power to impound": "/lesson/laborlaw115",
                "impoundment": "/lesson/laborlaw115",
                "informing power": "/lesson/laborlaw116",
                "discretionary power": "/lesson/laborlaw116",
                "residual powers": "/lesson/laborlaw116",
                "judicial power": "/lesson/laborlaw117",
                "expanded power of judicial review": "/lesson/laborlaw117",
                "grave abuse of discretion": "/lesson/laborlaw117",
                "power of judicial review": "/lesson/laborlaw118",
                "judicial review of impeachment cases": "/lesson/laborlaw118",
                "judicial supremacy": "/lesson/laborlaw118",
                "constitutional supremacy": "/lesson/laborlaw119",
                "political question doctrine": "/lesson/laborlaw119",
                "justiciable question": "/lesson/laborlaw119",
                "requisites of judicial review": "/lesson/laborlaw120",
                "actual case or controversy": "/lesson/laborlaw120",
                "ripeness for adjudication": "/lesson/laborlaw120",
                "mootness": "/lesson/laborlaw121",
                "ripeness vs. mootness": "/lesson/laborlaw121",
                "proper party": "/lesson/laborlaw121",
                "real-party-in interest": "/lesson/laborlaw122",
                "representational standing": "/lesson/laborlaw122",
                "class suit": "/lesson/laborlaw122",
                "class suit of a stockholder": "/lesson/laborlaw123",
                "jus tertii standing the public": "/lesson/laborlaw123",
                "class transcendental importance to the public": "/lesson/laborlaw123",
                "standing of members of congress": "/lesson/laborlaw124",
                "standing of integrated bar of the philippines": "/lesson/laborlaw124",
                "standing of the government to question its own laws": "/lesson/laborlaw124",
                "taxpayer's suits": "/lesson/laborlaw125",
                "concerned citizens' suit": "/lesson/laborlaw125",
                "question must be raised at the earliest possible opportunity": "/lesson/laborlaw125",
                "constitutional question must be the very lis mota of the case": "/lesson/laborlaw126",
                "functions of judicial review": "/lesson/laborlaw126",
                "adjudicative pragmatism": "/lesson/laborlaw126",
                "doctrine of purposeful hesitation": "/lesson/laborlaw127",
                "effects of declaration of unconstitutionality": "/lesson/laborlaw127",
                "doctrine of operative fact": "/lesson/laborlaw127",
                "jurisdiction": "/lesson/laborlaw128",
                "appellate jurisdiction of the supreme court": "/lesson/laborlaw129",
                "cases to be heard by the court en banc": "/lesson/laborlaw129",
                "case vs. matter": "/lesson/laborlaw129",
                "review of death penalty": "/lesson/laborlaw130",
                "independence of the judiciary": "/lesson/laborlaw130",
                "constitutional safeguards to insure judicial independence": "/lesson/laborlaw130",
                "fiscal autonomy": "/lesson/laborlaw131",
                "appointment to the judiciary": "/lesson/laborlaw131",
                "appointments to the judiciary not covered by election ban": "/lesson/laborlaw131",
                "judicial and bar council": "/lesson/laborlaw132",
                "a representative of congress in the judicial and bar council": "/lesson/laborlaw132",
                "the judicial and bar council is not a quasi-judicial body": "/lesson/laborlaw132",
                "composition of the supreme court": "/lesson/laborlaw133",
                "qualifications of the members of the supreme court": "/lesson/laborlaw133",
                "integrity as a qualification": "/lesson/laborlaw133",
                "non-filing of saln affects integrity": "/lesson/laborlaw134",
                "supervision over the judiciary": "/lesson/laborlaw134",
                "rule-making powers of the supreme court": "/lesson/laborlaw134",
                "writ of amparo": "/lesson/laborlaw135",
                "writ of habeas data": "/lesson/laborlaw135",
                "decisions of the court": "/lesson/laborlaw135",
                "power to control execution of decision": "/lesson/laborlaw136",
                "tenure of justices and judges": "/lesson/laborlaw136",
                "removal and discipline": "/lesson/laborlaw136",
                "members of the supreme court may be removed by quo warranto": "/lesson/laborlaw137",
                "salaries": "/lesson/laborlaw137",
                "judicial salary is not tax exempt": "/lesson/laborlaw137",
                "amendments and revision": "/lesson/laborlaw138",
                "tests to determine whether the proposal is amendment or revision": "/lesson/laborlaw139",
                "quantitative test": "/lesson/laborlaw139",
                "qualitative test": "/lesson/laborlaw139",
                "procedure": "/lesson/laborlaw140",
                "proposal": "/lesson/laborlaw140",
                "proposal by congress": "/lesson/laborlaw141",
                "constituent assembly": "/lesson/laborlaw141",
                "constitutional convention": "/lesson/laborlaw141",
                "how to call a constitutional convention": "/lesson/laborlaw142",
                "by a vote of two-thirds of the members of congress": "/lesson/laborlaw142",
                "by a majority vote of all the members of congress": "/lesson/laborlaw142",
                "people's initiative": "/lesson/laborlaw143",
                "republic act no. 6735": "/lesson/laborlaw143",
                "ratification": "/lesson/laborlaw143",
                "doctrine of proper submission": "/lesson/laborlaw144",
                "judicial review of amendment": "/lesson/laborlaw144",
                "independence of the commissions": "/lesson/laborlaw145",
                "appointment and term of office": "/lesson/laborlaw146",
                "disqualifications and inhibitions": "/lesson/laborlaw146",
                "certiorari to the supreme court": "/lesson/laborlaw146",
                "the civil service commission": "/lesson/laborlaw147",
                "the power of appointment": "/lesson/laborlaw147",
                "appeals from the decisions of the civil service commission": "/lesson/laborlaw147",
                "the commission on elections": "/lesson/laborlaw148",
                "appeals from commission on elections": "/lesson/laborlaw148",
                "regional trial court has no jurisdiction": "/lesson/laborlaw149",
                "petition for certiorari under rule 64": "/lesson/laborlaw149",
                "rule 64 is not the exclusive remedy": "/lesson/laborlaw149",
                "the commission on audit": "/lesson/laborlaw150",
                "composition of the commission on audit": "/lesson/laborlaw150",
                "powers of the commission on audit": "/lesson/laborlaw150",
                "appeals from commission on audit": "/lesson/laborlaw151",
                "public office is a public trust": "/lesson/laborlaw152",
                "impeachment": "/lesson/laborlaw152",
                "impeachable officers and grounds for impeachment": "/lesson/laborlaw153",
                "procedure for impeachment": "/lesson/laborlaw153",
                "impeachment result and criminal prosecution": "/lesson/laborlaw153",
                "impeachment and double jeopardy": "/lesson/laborlaw154",
                "the sandiganbayan": "/lesson/laborlaw154",
                "the crime must be connected with the discharge of official functions": "/lesson/laborlaw155",
                "the ombudsman": "/lesson/laborlaw155",
                "qualifications of the ombudsman": "/lesson/laborlaw155",
                "appointment of ombudsman": "/lesson/laborlaw156",
                "jurisdiction of the ombudsman": "/lesson/laborlaw156",
                "office of the special prosecutor": "/lesson/laborlaw156",
                "appeals from the decisions of the ombudsman": "/lesson/laborlaw157",
                "power over elected officials": "/lesson/laborlaw157",
                "powers concurrent with the department of justice": "/lesson/laborlaw157",
                "ombudsman has no investigative power over the judiciary": "/lesson/laborlaw158",
                "ombudsman for the military": "/lesson/laborlaw158",
                "impeachment of the ombudsman": "/lesson/laborlaw158",
                "deputy ombudsman not impeachable official": "/lesson/laborlaw159",
                "the president may not remove a deputy ombudsman": "/lesson/laborlaw159",
                "the president may remove a special prosecutor": "/lesson/laborlaw159"
            };

            const topicKey = Object.keys(topicNames).find(topic => command.includes(topic));
            if (topicKey) {
                const topicURL = topicNames[topicKey];
                if (speechSynthesis.speaking) speechSynthesis.cancel(); // Stop TTS before navigating
                speakAndExecute(`Navigating to the topic: ${topicKey}.`, () => window.location.href = topicURL);
            } else {
                speakAndExecute("The specified topic was not recognized.", null);
            }
        } else {
            speakAndExecute("Command not recognized. Please try again.", null);
        }

        function extractPageNumber() {
            const currentUrl = window.location.href;
            const match = currentUrl.match(/lesson\/laborlaw(\d+)/);
            return match ? parseInt(match[1], 10) : null;
        }

        function navigateToPage(pageNumber) {
            const newUrl = `/lesson/laborlaw${pageNumber}`;
            window.location.href = newUrl;
        }

        // Handle errors in speech recognition
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            recognizing = false;
            document.getElementById('speech-command').innerHTML = '<ion-icon name="mic"></ion-icon>'; // Reset mic icon
        };

        // Restart recognition once it ends (for continuous listening)
        recognition.onend = () => {
            if (recognizing) {
                recognition.start(); // Restart recognition after it ends
            }
        };
    }

    // Handle page load
    document.addEventListener('DOMContentLoaded', () => {
        if ('speechSynthesis' in window) {
            speechSynthesis.onvoiceschanged = loadVoices;
            loadVoices();
        }
        document.getElementById('readBtn').addEventListener('click', () => {
            // Trigger readText function when the Read button is clicked
            readText();
        });
        document.getElementById('pauseBtn').addEventListener('click', togglePauseResume);
        document.getElementById('stopBtn').addEventListener('click', stopSpeech);
        initializeSpeechRecognition();
    });

    // Cancel speech synthesis on page unload
    window.addEventListener('beforeunload', () => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    });

    // Your existing pagination logic, slightly adjusted
function generatePagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ""; // Clear any existing links

    const maxLinks = 5; // Maximum number of links to display
    const halfRange = Math.floor(maxLinks / 2);

    // Calculate the start and end of the page range
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);

    // Adjust range if we’re near the start or end of total pages
    if (currentPage <= halfRange) {
        endPage = Math.min(totalPages, maxLinks);
    } else if (currentPage + halfRange > totalPages) {
        startPage = Math.max(1, totalPages - maxLinks + 1);
    }

    // Create "Previous" button
    if (currentPage > 1) {
        const prevLink = document.createElement('a');
        prevLink.href = `/lesson/laborlaw${currentPage - 1}`;
        prevLink.textContent = "Previous";
        paginationContainer.appendChild(prevLink);
        paginationContainer.appendChild(document.createTextNode(" | "));
    }

    // Generate numbered page links
    for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = `/lesson/laborlaw${i}`;
        pageLink.textContent = i;

        if (i === currentPage) {
            pageLink.classList.add('active'); // Highlight current page
        }

        paginationContainer.appendChild(pageLink);

        if (i < endPage) {
            paginationContainer.appendChild(document.createTextNode(" | "));
        }
    }

    // Create "Next" button
    if (currentPage < totalPages) {
        const nextLink = document.createElement('a');
        nextLink.href = `/lesson/laborlaw${currentPage + 1}`;
        nextLink.textContent = "Next";
        paginationContainer.appendChild(document.createTextNode(" | "));
        paginationContainer.appendChild(nextLink);
    }
}

// Helper function to get the current page from URL (this works with your current URL structure)
function getCurrentPage() {
    const currentPageMatch = window.location.pathname.match(/laborlaw(\d+)/);
    return currentPageMatch ? parseInt(currentPageMatch[1], 10) : 1;
}

// Initialize pagination on page load
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = getCurrentPage();
    const totalPages = 159; // Adjust to your actual total page count
    generatePagination(currentPage, totalPages);
});


    document.addEventListener("DOMContentLoaded", () => {
        const tocChapters = document.querySelectorAll(".toc-content > ul > li");

        tocChapters.forEach(chapter => {
            chapter.addEventListener("click", function (e) {
                // Prevent collapsing if a link is clicked
                if (e.target.tagName === 'A') return;

                // Toggle the "expanded" class
                this.classList.toggle("expanded");
            });
        });
    });
    
    document.addEventListener("DOMContentLoaded", () => {
        const voiceCommandBar = document.getElementById("voiceCommandBar");
        const closeCommandBar = document.getElementById("closeCommandBar");
        const toggleButton = document.getElementById("toggleCommandBar"); // Add toggle button

        // Function to show the command bar
        function showCommandBar() {
            voiceCommandBar.style.display = "block";
        }

        // Function to hide the command bar
        function hideCommandBar() {
            voiceCommandBar.style.display = "none";
        }

        // Function to toggle the command bar
        function toggleCommandBar() {
            if (voiceCommandBar.style.display === "block") {
                hideCommandBar();
            } else {
                showCommandBar();
            }
        }

        // Event listener to close the command bar
        closeCommandBar.addEventListener("click", hideCommandBar);

        // Event listener for the toggle button
        toggleButton.addEventListener("click", toggleCommandBar);

        // Example: Trigger the popup when a specific event occurs (e.g., pressing '?')
        document.addEventListener("keydown", (event) => {
            if (event.key === "?") { // Press '?' key to toggle commands
                toggleCommandBar();
            }
        });
    });

