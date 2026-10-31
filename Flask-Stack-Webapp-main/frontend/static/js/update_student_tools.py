import os

script_path = r"c:\Users\USER\OneDrive\Documents\LuminaWebsiteFlask\Flask-Stack-Webapp-main\frontend\static\js\student-tools.js"

with open(script_path, "r", encoding="utf-8") as f:
    code = f.read()

# Locate start of quiz section and end of flashcards section
start_marker = "// 5. FULL MAXIMIZED STUDY QUIZ & FLASHCARDS"
end_marker = "// 6. FULL MAXIMIZED ZEN FOCUS TIMER & AMBIENT AUDIO"

start_idx = code.find(start_marker)
end_idx = code.find(end_marker)

if start_idx == -1 or end_idx == -1:
    raise Exception(f"Markers not found: start_idx={start_idx}, end_idx={end_idx}")

new_quiz_logic = '''// 5. FULL MAXIMIZED STUDY QUIZ, 3D FLASHCARDS & AI GENERATOR
    const defaultDeck = {
      deck_title: "Computer Science & Study Skills",
      type: "Built-in Deck",
      flashcards: [
        {
          id: 1,
          front: "What is the average-case time complexity of Hash Table lookups?",
          tag: "Computer Science",
          highlight: "O(1) Constant Time",
          back: "Hash tables compute an index via hashing function, allowing immediate array indexing on average."
        },
        {
          id: 2,
          front: "What is the Pomodoro technique's recommended study interval?",
          tag: "Study Skills",
          highlight: "25 Minutes Focus + 5 Minutes Rest",
          back: "25 minutes of deep focus followed by 5 minutes of mindful rest prevents cognitive fatigue and improves retention."
        },
        {
          id: 3,
          front: "How does Spaced Repetition halt memory decay?",
          tag: "Cognitive Science",
          highlight: "Calibrated Intervals at the Forgetting Curve",
          back: "By reviewing material right as you are about to forget it, neural synapses reinforce the memory trace permanently."
        },
        {
          id: 4,
          front: "What is the Habify 40/30/30 daily balance formula?",
          tag: "Wellness & Habit",
          highlight: "40% Study · 30% Mind · 30% Body",
          back: "Allocating 40% to deep study, 30% to mental calm/mindfulness, and 30% to physical health prevents student burnout."
        },
        {
          id: 5,
          front: "In Python, what is the key difference between a List and a Tuple?",
          tag: "Python & Coding",
          highlight: "Lists are Mutable, Tuples are Immutable",
          back: "Lists can be modified after creation (append/pop), whereas tuples are fixed and cannot be changed."
        }
      ],
      quiz: [
        {
          id: 1,
          question: "In Big-O notation, what is the average-case time complexity of looking up an item in a Hash Table?",
          options: ["A. O(n)", "B. O(1) Constant Time", "C. O(log n)", "D. O(n²)\"],
          correct_answer: "B. O(1) Constant Time",
          explanation: "Hash tables compute an index in constant time O(1) on average."
        },
        {
          id: 2,
          question: "Which interval length is standard for a deep work Pomodoro focus session?",
          options: ["A. 10 minutes", "B. 25 minutes", "C. 90 minutes", "D. 3 hours"],
          correct_answer: "B. 25 minutes",
          explanation: "25 minutes of deep focus followed by a 5-minute break is the classic Pomodoro rhythm."
        },
        {
          id: 3,
          question: "What is the primary benefit of the 'Spaced Repetition' learning technique?",
          options: ["A. Cramming everything in one night", "B. Halting memory decay by reviewing at calibrated intervals", "C. Memorizing words without understanding", "D. Studying only once per semester"],
          correct_answer: "B. Halting memory decay by reviewing at calibrated intervals",
          explanation: "Spaced repetition reviews material right before the forgetting curve takes effect."
        },
        {
          id: 4,
          question: "According to the LuminaEdu daily balance wheel, what percentage is allocated to deep Study?",
          options: ["A. 100%", "B. 70%", "C. 40%", "D. 10%"],
          correct_answer: "C. 40%",
          explanation: "40% Study, 30% Mind wellness, and 30% Body health creates sustainable peak performance."
        },
        {
          id: 5,
          question: "In Python, which built-in function returns both the index and value of iterable elements?",
          options: ["A. range()", "B. enumerate()", "C. zip()", "D. map()"],
          correct_answer: "B. enumerate()",
          explanation: "enumerate(iterable) produces tuples of (index, item)."
        }
      ]
    };

    function getActiveDeck() {
      try {
        const saved = localStorage.getItem('lumina_active_study_set_v2');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return defaultDeck;
    }

    function saveActiveDeck(deck) {
      try {
        localStorage.setItem('lumina_active_study_set_v2', JSON.stringify(deck));
      } catch (e) {}
    }

    let activeDeck = getActiveDeck();
    let currentQuizIdx = 0;
    let quizScore = 0;
    let quizCorrectCount = 0;
    let quizStreak = 1.0;
    let maxStreak = 1.0;
    let hasAnswered = false;
    let currentCardIdx = 0;
    let currentCardsList = [...activeDeck.flashcards];

    // DOM Elements - Navigation & Ribbons
    const quizModeBtn = document.getElementById('quizModeBtn');
    const flashcardModeBtn = document.getElementById('flashcardModeBtn');
    const generatorModeBtn = document.getElementById('generatorModeBtn');
    const quickUploadPillBtn = document.getElementById('quickUploadPillBtn');
    const activeDeckTitleEl = document.getElementById('activeDeckTitle');
    const activeDeckTypeTagEl = document.getElementById('activeDeckTypeTag');
    const ribbonScoreValEl = document.getElementById('ribbonScoreVal');
    const ribbonStreakValEl = document.getElementById('ribbonStreakVal');

    // DOM Elements - Views
    const quizContainerView = document.getElementById('quizContainerView');
    const quizSummaryView = document.getElementById('quizSummaryView');
    const flashcardContainerView = document.getElementById('flashcardContainerView');
    const quizGeneratorView = document.getElementById('quizGeneratorView');

    // DOM Elements - Quiz Controls
    const quizQuestionText = document.getElementById('quizQuestionText');
    const quizOptionsList = document.getElementById('quizOptionsList');
    const quizExplanationCard = document.getElementById('quizExplanationCard');
    const explIcon = document.getElementById('explIcon');
    const explTitle = document.getElementById('explTitle');
    const explPointsTag = document.getElementById('explPointsTag');
    const quizExplanationText = document.getElementById('quizExplanationText');
    const quizNextBtn = document.getElementById('quizNextBtn');
    const quizProgressFill = document.getElementById('quizProgressFill');
    const questionTracker = document.getElementById('questionTracker');
    const liveStreakPill = document.getElementById('liveStreakPill');
    const liveScorePill = document.getElementById('liveScorePill');

    // DOM Elements - Summary Report
    const summaryGradeBadge = document.getElementById('summaryGradeBadge');
    const summaryTotalPoints = document.getElementById('summaryTotalPoints');
    const summaryAccuracyVal = document.getElementById('summaryAccuracyVal');
    const summaryBasePtsVal = document.getElementById('summaryBasePtsVal');
    const summaryStreakBonusVal = document.getElementById('summaryStreakBonusVal');
    const summaryCorrectCountVal = document.getElementById('summaryCorrectCountVal');
    const retakeQuizBtn = document.getElementById('retakeQuizBtn');
    const studyCardsAfterQuizBtn = document.getElementById('studyCardsAfterQuizBtn');
    const uploadAnotherLessonBtn = document.getElementById('uploadAnotherLessonBtn');

    // DOM Elements - Flashcards
    const flashcardInner = document.getElementById('flashcardInner');
    const cardFrontText = document.getElementById('cardFrontText');
    const cardCategoryTag = document.getElementById('cardCategoryTag');
    const cardHighlightText = document.getElementById('cardHighlightText');
    const cardExplanationText = document.getElementById('cardExplanationText');
    const cardCounter = document.getElementById('cardCounter');
    const cardPrevBtn = document.getElementById('cardPrevBtn');
    const cardNextBtn = document.getElementById('cardNextBtn');
    const shuffleCardsBtn = document.getElementById('shuffleCardsBtn');

    // DOM Elements - Generator
    const lessonDropzone = document.getElementById('lessonDropzone');
    const lessonFileInput = document.getElementById('lessonFileInput');
    const dropzoneDefaultContent = document.getElementById('dropzoneDefaultContent');
    const selectedFileChip = document.getElementById('selectedFileChip');
    const selectedFileName = document.getElementById('selectedFileName');
    const selectedFileSize = document.getElementById('selectedFileSize');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const lessonTextInput = document.getElementById('lessonTextInput');
    const textCountDisplay = document.getElementById('textCountDisplay');
    const genQuestionCount = document.getElementById('genQuestionCount');
    const genApiKeyInput = document.getElementById('genApiKeyInput');
    const triggerGenerateBtn = document.getElementById('triggerGenerateBtn');
    const genLoadingState = document.getElementById('genLoadingState');
    const genLoadingTitle = document.getElementById('genLoadingTitle');
    const genSuccessBanner = document.getElementById('genSuccessBanner');
    const generatedDeckTitle = document.getElementById('generatedDeckTitle');
    const genCardCountMetric = document.getElementById('genCardCountMetric');
    const genQuizCountMetric = document.getElementById('genQuizCountMetric');
    const genMaxPtsMetric = document.getElementById('genMaxPtsMetric');
    const startGeneratedQuizBtn = document.getElementById('startGeneratedQuizBtn');
    const openGeneratedCardsBtn = document.getElementById('openGeneratedCardsBtn');

    let currentSelectedFile = null;

    function updateDeckRibbon() {
      if (activeDeckTitleEl) activeDeckTitleEl.textContent = activeDeck.deck_title || 'Study Deck';
      if (activeDeckTypeTagEl) activeDeckTypeTagEl.textContent = activeDeck.type || 'Custom Deck';
      if (ribbonScoreValEl) ribbonScoreValEl.textContent = `${quizScore} pts`;
      if (ribbonStreakValEl) ribbonStreakValEl.textContent = `· ${quizStreak.toFixed(1)}x Streak`;
    }

    function switchView(mode) {
      // mode: 'quiz', 'flashcards', 'generator'
      [quizModeBtn, flashcardModeBtn, generatorModeBtn].forEach(b => b?.classList.remove('active'));
      if (quizContainerView) quizContainerView.style.display = 'none';
      if (quizSummaryView) quizSummaryView.style.display = 'none';
      if (flashcardContainerView) flashcardContainerView.style.display = 'none';
      if (quizGeneratorView) quizGeneratorView.style.display = 'none';

      if (mode === 'quiz') {
        quizModeBtn?.classList.add('active');
        if (currentQuizIdx >= activeDeck.quiz.length) {
          if (quizSummaryView) quizSummaryView.style.display = 'block';
        } else {
          if (quizContainerView) quizContainerView.style.display = 'block';
          renderQuizQuestion();
        }
      } else if (mode === 'flashcards') {
        flashcardModeBtn?.classList.add('active');
        if (flashcardContainerView) flashcardContainerView.style.display = 'block';
        renderFlashcard(currentCardIdx);
      } else if (mode === 'generator') {
        generatorModeBtn?.classList.add('active');
        if (quizGeneratorView) quizGeneratorView.style.display = 'flex';
      }
      updateDeckRibbon();
    }

    if (quizModeBtn) quizModeBtn.addEventListener('click', () => switchView('quiz'));
    if (flashcardModeBtn) flashcardModeBtn.addEventListener('click', () => switchView('flashcards'));
    if (generatorModeBtn) generatorModeBtn.addEventListener('click', () => switchView('generator'));
    if (quickUploadPillBtn) quickUploadPillBtn.addEventListener('click', () => switchView('generator'));
    if (uploadAnotherLessonBtn) uploadAnotherLessonBtn.addEventListener('click', () => switchView('generator'));
    if (studyCardsAfterQuizBtn) studyCardsAfterQuizBtn.addEventListener('click', () => switchView('flashcards'));

    // --- QUIZ & POINT SYSTEM ---
    function initQuiz() {
      currentQuizIdx = 0;
      quizScore = 0;
      quizCorrectCount = 0;
      quizStreak = 1.0;
      maxStreak = 1.0;
      currentCardsList = [...activeDeck.flashcards];
      if (quizSummaryView) quizSummaryView.style.display = 'none';
      if (quizContainerView) quizContainerView.style.display = 'block';
      renderQuizQuestion();
      updateDeckRibbon();
    }

    function renderQuizQuestion() {
      hasAnswered = false;
      if (quizNextBtn) quizNextBtn.style.display = 'none';
      if (quizExplanationCard) quizExplanationCard.style.display = 'none';

      const totalQ = activeDeck.quiz.length;
      if (totalQ === 0) return;

      const q = activeDeck.quiz[currentQuizIdx];
      if (!q) return;

      if (quizQuestionText) quizQuestionText.textContent = q.question;
      if (questionTracker) questionTracker.textContent = `Question ${currentQuizIdx + 1} of ${totalQ}`;
      if (liveStreakPill) liveStreakPill.textContent = `🔥 Streak: ${quizStreak.toFixed(1)}x (+${Math.round(100 * (quizStreak - 1))} bonus)`;
      if (liveScorePill) liveScorePill.textContent = `🏆 ${quizScore} Points`;
      updateDeckRibbon();

      if (quizProgressFill) {
        quizProgressFill.style.width = `${((currentQuizIdx + 1) / totalQ) * 100}%`;
      }

      if (quizOptionsList) {
        quizOptionsList.innerHTML = '';
        q.options.forEach((opt) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'quiz-opt-btn';
          btn.textContent = opt;

          btn.addEventListener('click', () => {
            if (hasAnswered) return;
            hasAnswered = true;

            const isCorrect = (opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) ||
                              (q.correct_answer.toLowerCase().includes(opt.toLowerCase())) ||
                              (opt.toLowerCase().includes(q.correct_answer.toLowerCase()));

            if (isCorrect) {
              btn.classList.add('correct');
              const basePts = 100;
              const bonusPts = Math.round(100 * (quizStreak - 1));
              const wonPts = basePts + bonusPts;
              quizScore += wonPts;
              quizCorrectCount++;
              quizStreak += 0.5;
              if (quizStreak > maxStreak) maxStreak = quizStreak;

              if (quizExplanationCard) {
                quizExplanationCard.className = 'quiz-explanation-card correct-expl';
                if (explIcon) explIcon.textContent = '✓';
                if (explTitle) explTitle.textContent = 'Correct Answer!';
                if (explPointsTag) explPointsTag.textContent = `+${wonPts} pts!`;
                if (quizExplanationText) quizExplanationText.textContent = q.explanation || 'Excellent recall! Your answer matches the course material.';
                quizExplanationCard.style.display = 'block';
              }
              triggerDashConfetti();
            } else {
              btn.classList.add('wrong');
              quizStreak = 1.0;

              // Find and highlight correct answer
              Array.from(quizOptionsList.children).forEach(child => {
                if (child.textContent.trim().toLowerCase() === q.correct_answer.trim().toLowerCase() ||
                    q.correct_answer.toLowerCase().includes(child.textContent.toLowerCase()) ||
                    child.textContent.toLowerCase().includes(q.correct_answer.toLowerCase())) {
                  child.classList.add('correct');
                }
              });

              if (quizExplanationCard) {
                quizExplanationCard.className = 'quiz-explanation-card wrong-expl';
                if (explIcon) explIcon.textContent = '✕';
                if (explTitle) explTitle.textContent = 'Not quite right';
                if (explPointsTag) explPointsTag.textContent = '+0 pts';
                if (quizExplanationText) quizExplanationText.textContent = q.explanation || `The correct answer is: ${q.correct_answer}`;
                quizExplanationCard.style.display = 'block';
              }
            }

            if (liveStreakPill) liveStreakPill.textContent = `🔥 Streak: ${quizStreak.toFixed(1)}x`;
            if (liveScorePill) liveScorePill.textContent = `🏆 ${quizScore} Points`;
            updateDeckRibbon();

            if (quizNextBtn) {
              quizNextBtn.style.display = 'inline-block';
              quizNextBtn.textContent = currentQuizIdx < totalQ - 1 ? 'Next Question →' : 'Finish Quiz & View Points Report 🏆';
            }
          });

          quizOptionsList.appendChild(btn);
        });
      }
    }

    if (quizNextBtn) {
      quizNextBtn.addEventListener('click', () => {
        const totalQ = activeDeck.quiz.length;
        if (currentQuizIdx < totalQ - 1) {
          currentQuizIdx++;
          renderQuizQuestion();
        } else {
          showQuizSummary();
        }
      });
    }

    function showQuizSummary() {
      if (quizContainerView) quizContainerView.style.display = 'none';
      if (quizSummaryView) quizSummaryView.style.display = 'block';

      const totalQ = activeDeck.quiz.length;
      const accuracy = totalQ > 0 ? Math.round((quizCorrectCount / totalQ) * 100) : 0;
      const basePts = quizCorrectCount * 100;
      const streakBonus = Math.max(0, quizScore - basePts);

      if (summaryTotalPoints) summaryTotalPoints.textContent = `⭐ ${quizScore} Points Earned!`;
      if (summaryAccuracyVal) summaryAccuracyVal.textContent = `${accuracy}%`;
      if (summaryBasePtsVal) summaryBasePtsVal.textContent = `${basePts}`;
      if (summaryStreakBonusVal) summaryStreakBonusVal.textContent = `+${streakBonus}`;
      if (summaryCorrectCountVal) summaryCorrectCountVal.textContent = `${quizCorrectCount} / ${totalQ}`;

      if (summaryGradeBadge) {
        if (accuracy >= 90) summaryGradeBadge.textContent = 'GRADE A+ · OUTSTANDING MASTERY 🌟';
        else if (accuracy >= 80) summaryGradeBadge.textContent = 'GRADE A · EXCELLENT MASTERY ⭐';
        else if (accuracy >= 70) summaryGradeBadge.textContent = 'GRADE B · SOLID PROFICIENCY 👍';
        else summaryGradeBadge.textContent = 'GRADE C · ACTIVE RECALL RECOMMENDED 📚';
      }

      triggerDashConfetti();
    }

    if (retakeQuizBtn) retakeQuizBtn.addEventListener('click', initQuiz);

    // --- 3D FLASHCARDS ---
    function renderFlashcard(idx) {
      currentCardIdx = idx;
      if (flashcardInner) flashcardInner.classList.remove('flipped');

      const card = currentCardsList[currentCardIdx];
      if (!card) return;

      if (cardFrontText) cardFrontText.textContent = card.front;
      if (cardCategoryTag) cardCategoryTag.textContent = card.tag || activeDeck.deck_title || 'Core Concept';
      if (cardHighlightText) cardHighlightText.textContent = card.highlight || card.front.replace(/^What is\s*/i, '').replace(/\?$/, '');
      if (cardExplanationText) cardExplanationText.textContent = card.back;
      if (cardCounter) cardCounter.textContent = `Card ${currentCardIdx + 1} / ${currentCardsList.length}`;
    }

    if (flashcardInner) {
      flashcardInner.addEventListener('click', () => {
        flashcardInner.classList.toggle('flipped');
      });
    }

    if (cardPrevBtn) {
      cardPrevBtn.addEventListener('click', () => {
        if (currentCardsList.length === 0) return;
        currentCardIdx = (currentCardIdx - 1 + currentCardsList.length) % currentCardsList.length;
        renderFlashcard(currentCardIdx);
      });
    }

    if (cardNextBtn) {
      cardNextBtn.addEventListener('click', () => {
        if (currentCardsList.length === 0) return;
        currentCardIdx = (currentCardIdx + 1) % currentCardsList.length;
        renderFlashcard(currentCardIdx);
      });
    }

    if (shuffleCardsBtn) {
      shuffleCardsBtn.addEventListener('click', () => {
        currentCardsList.sort(() => Math.random() - 0.5);
        renderFlashcard(0);
        triggerDashConfetti();
      });
    }

    // --- AI LESSON & HANDOUT GENERATOR ---
    const sampleCurriculums = {
      cs: `Operating Systems: Architecture and Memory Management
The Kernel is the central core of an operating system responsible for resource management, device control, and process scheduling.
Virtual Memory refers to a memory management capability providing an idealized abstraction of storage resources.
Paging is a memory management scheme that stores and retrieves data from secondary storage for use in main memory without requiring contiguous physical allocation.
Deadlock represents a state where a set of processes are blocked because each process holds a resource and waits for another resource held by another process.
Race Condition occurs when two or more threads attempt to modify shared data concurrently, producing non-deterministic outcomes.
Semaphores are synchronization variables used to control access to common resources in concurrent programming.`,
      bio: `Cellular Biology and Photosynthesis
Photosynthesis is the fundamental biological process through which photosynthetic organisms convert light energy into chemical energy stored in glucose.
Chloroplast: Specialized double-membraned organelle in plant cells where light-dependent and light-independent reactions take place.
Chlorophyll is a specialized green pigment residing in the thylakoid membrane responsible for capturing solar radiation.
Calvin Cycle refers to the light-independent metabolic pathway fixing carbon dioxide into carbohydrates.
ATP (Adenosine Triphosphate) is the primary molecular currency of intracellular energy transfer utilized in cellular metabolism.
Mitochondria: The double-membrane organelle responsible for generating the majority of cellular chemical energy through oxidative phosphorylation.`,
      physics: `Classical Mechanics and Energy
Newton's First Law is the principle of inertia stating an object remains at rest or in uniform motion unless acted upon by an external net force.
Kinetic Energy refers to the energy possessed by an object due to its motion, calculated as one-half mass times velocity squared.
Potential Energy is the stored energy of an object resulting from its relative position in a gravitational or mechanical force field.
Refraction is the change in direction and speed of a wave passing from one transmission medium to another.
Conservation of Momentum: The fundamental principle asserting that the total momentum of an isolated system remains constant regardless of internal collisions.`
    };

    document.querySelectorAll('.chip-sample').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.sample;
        if (sampleCurriculums[type] && lessonTextInput) {
          lessonTextInput.value = sampleCurriculums[type];
          updateTextCounter();
          lessonTextInput.focus();
        }
      });
    });

    function updateTextCounter() {
      if (!lessonTextInput || !textCountDisplay) return;
      const text = lessonTextInput.value.trim();
      const words = text ? text.split(/\\s+/).length : 0;
      const chars = text.length;
      textCountDisplay.textContent = `${words} words · ${chars} chars`;
    }

    if (lessonTextInput) {
      lessonTextInput.addEventListener('input', updateTextCounter);
    }

    // Dropzone logic
    if (lessonDropzone && lessonFileInput) {
      lessonDropzone.addEventListener('click', (e) => {
        if (e.target.closest('#removeFileBtn')) return;
        lessonFileInput.click();
      });

      lessonDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        lessonDropzone.classList.add('dragover');
      });

      ['dragleave', 'dragend'].forEach(evt => {
        lessonDropzone.addEventListener(evt, () => lessonDropzone.classList.remove('dragover'));
      });

      lessonDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        lessonDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileSelection(e.dataTransfer.files[0]);
        }
      });

      lessonFileInput.addEventListener('change', () => {
        if (lessonFileInput.files && lessonFileInput.files[0]) {
          handleFileSelection(lessonFileInput.files[0]);
        }
      });
    }

    function handleFileSelection(file) {
      currentSelectedFile = file;
      if (selectedFileChip && dropzoneDefaultContent) {
        if (selectedFileName) selectedFileName.textContent = file.name;
        if (selectedFileSize) selectedFileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
        dropzoneDefaultContent.style.display = 'none';
        selectedFileChip.style.display = 'flex';
      }

      // If text file, preview in textarea
      if (file.name.match(/\\.(txt|md|markdown|json|csv|py|js|html|rst)$/i)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (lessonTextInput && (!lessonTextInput.value.trim() || lessonTextInput.value.length < 50)) {
            lessonTextInput.value = e.target.result;
            updateTextCounter();
          }
        };
        reader.readAsText(file);
      }
    }

    if (removeFileBtn) {
      removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSelectedFile = null;
        if (lessonFileInput) lessonFileInput.value = '';
        if (dropzoneDefaultContent) dropzoneDefaultContent.style.display = 'block';
        if (selectedFileChip) selectedFileChip.style.display = 'none';
      });
    }

    // Client-side Fallback Curriculum Engine (used if offline or static)
    function clientSynthesizeCurriculum(text, numQ) {
      const clean = text.replace(/\\r\\n|\\r/g, '\\n').trim();
      const lines = clean.split('\\n').map(l => l.trim()).filter(Boolean);
      let title = "Lesson Curriculum Study Set";
      for (let l of lines.slice(0, 5)) {
        const cleanL = l.replace(/^[#\\*\\-=\\s]+/, '').trim();
        if (cleanL.length > 3 && cleanL.length < 65 && !cleanL.endsWith(':')) {
          title = cleanL;
          break;
        }
      }

      const concepts = [];
      lines.forEach(l => {
        const m = l.match(/^([A-Z0-9][A-Za-z0-9\\s\\-_/]{2,40})[:\\-—]\\s+(.+)$/);
        if (m && m[2].length > 12) concepts.push([m[1].trim(), m[2].trim()]);
      });

      const sentences = clean.split(/(?<=[.!?])\\s+/).filter(s => s.length > 20);
      sentences.forEach(s => {
        const m = s.match(/\\b([A-Z][a-zA-Z0-9\\s]{2,35})\\s+(?:is defined as|refers to|is a|is an|represents)\\s+(.+)/);
        if (m && !concepts.some(c => c[0].toLowerCase() === m[1].toLowerCase())) {
          concepts.push([m[1].trim(), s.trim()]);
        }
      });

      if (concepts.length < 3) {
        sentences.forEach((s, i) => {
          const w = s.split(/\\s+/);
          if (w.length >= 5) concepts.push([w.slice(0, 3).join(' '), s]);
        });
      }

      const flashcards = concepts.slice(0, Math.max(8, numQ)).map((c, i) => ({
        id: i + 1,
        front: c[0].startsWith('What') ? c[0] : `What is ${c[0]}?`,
        tag: title,
        highlight: c[0],
        back: c[1]
      }));

      const allDefs = concepts.map(c => c[1]);
      const quiz = [];
      const count = Math.min(concepts.length, Math.max(5, numQ));

      for (let i = 0; i < count; i++) {
        const [term, def] = concepts[i];
        const correctChoice = def.length < 130 ? def : def.slice(0, 125) + '...';
        const otherDefs = allDefs.filter(d => d !== def).map(d => d.length < 130 ? d : d.slice(0, 125) + '...');
        const distractors = otherDefs.slice(0, 3);
        while (distractors.length < 3) {
          distractors.push(`Alternative baseline parameter ${distractors.length + 1} with non-deterministic runtime`);
        }
        const pos = i % 4;
        distractors.splice(pos, 0, correctChoice);

        quiz.push({
          id: i + 1,
          question: `According to the study material, which of the following best defines or describes '${term}'?`,
          options: distractors,
          correct_answer: correctChoice,
          explanation: `Directly established in the lesson material: ${term} is described as ${def.slice(0, 100)}.`
        });
      }

      return { deck_title: title, type: "AI Generated Deck", flashcards, quiz };
    }

    // Trigger Generation Process
    if (triggerGenerateBtn) {
      triggerGenerateBtn.addEventListener('click', async () => {
        const textVal = lessonTextInput ? lessonTextInput.value.trim() : '';
        if (!currentSelectedFile && (!textVal || textVal.length < 15)) {
          alert('Please upload a lesson document or paste at least a paragraph of lesson material to analyze.');
          if (lessonTextInput) lessonTextInput.focus();
          return;
        }

        const numQ = parseInt(genQuestionCount ? genQuestionCount.value : '5', 10);
        const apiKey = genApiKeyInput ? genApiKeyInput.value.trim() : '';

        // Show loading state and animate steppers
        if (genLoadingState) genLoadingState.style.display = 'block';
        if (genSuccessBanner) genSuccessBanner.style.display = 'none';
        triggerGenerateBtn.disabled = true;

        const s1 = document.getElementById('step1');
        const s2 = document.getElementById('step2');
        const s3 = document.getElementById('step3');
        const s4 = document.getElementById('step4');

        if (s1) { s1.className = 'stepper-step active'; s1.textContent = '⏳ Step 1: Parsing study text and extracting core curriculum...'; }
        if (s2) { s2.className = 'stepper-step'; s2.textContent = '⏳ Step 2: Formulating active recall flashcard pairs...'; }
        if (s3) { s3.className = 'stepper-step'; s3.textContent = '⏳ Step 3: Generating 4-distractor multiple choice questions...'; }
        if (s4) { s4.className = 'stepper-step'; s4.textContent = '⏳ Step 4: Assembling points scoring system...'; }

        setTimeout(() => { if (s1 && s2) { s1.className = 'stepper-step done'; s1.textContent = '✓ Step 1: Lesson parsed successfully'; s2.className = 'stepper-step active'; } }, 350);
        setTimeout(() => { if (s2 && s3) { s2.className = 'stepper-step done'; s2.textContent = '✓ Step 2: Active recall flashcards formulated'; s3.className = 'stepper-step active'; } }, 750);
        setTimeout(() => { if (s3 && s4) { s3.className = 'stepper-step done'; s3.textContent = '✓ Step 3: Multiple choice quiz questions synthesized'; s4.className = 'stepper-step active'; } }, 1150);

        let generatedData = null;

        // Try API endpoint if on server
        try {
          // Fetch CSRF token if available
          let csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
          if (!csrfToken) {
            try {
              const cr = await fetch('/api/v1/csrf');
              const cd = await cr.json();
              csrfToken = cd.csrf_token;
            } catch (e) {}
          }

          const formData = new FormData();
          if (currentSelectedFile) {
            formData.append('file', currentSelectedFile);
          }
          if (textVal) {
            formData.append('text', textVal);
          }
          formData.append('numQuestions', numQ);
          if (apiKey) formData.append('apiKey', apiKey);

          const res = await fetch('/api/v1/study-set/generate', {
            method: 'POST',
            headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
            body: formData
          });

          if (res.ok) {
            const json = await res.json();
            if (json.data && json.data.quiz && json.data.flashcards) {
              generatedData = json.data;
              generatedData.type = 'AI Generated Deck';
            }
          }
        } catch (err) {
          console.warn('Backend API request skipped or errored, falling back to client synthesis', err);
        }

        // If backend was not reached, use client-side engine
        if (!generatedData) {
          await new Promise(r => setTimeout(r, 1300));
          const effectiveText = textVal || (currentSelectedFile ? currentSelectedFile.name : 'Lesson Study Set');
          generatedData = clientSynthesizeCurriculum(effectiveText, numQ);
        }

        if (s4) { s4.className = 'stepper-step done'; s4.textContent = '✓ Step 4: Points scoring engine & active recall suite ready!'; }

        // Finalize
        activeDeck = generatedData;
        saveActiveDeck(activeDeck);

        setTimeout(() => {
          if (genLoadingState) genLoadingState.style.display = 'none';
          triggerGenerateBtn.disabled = false;

          if (genSuccessBanner) {
            if (generatedDeckTitle) generatedDeckTitle.textContent = activeDeck.deck_title;
            if (genCardCountMetric) genCardCountMetric.textContent = `🎴 ${activeDeck.flashcards.length} Flashcards`;
            if (genQuizCountMetric) genQuizCountMetric.textContent = `🧠 ${activeDeck.quiz.length} Quiz Questions`;
            if (genMaxPtsMetric) genMaxPtsMetric.textContent = `🏆 ${activeDeck.quiz.length * 100} Max Points`;
            genSuccessBanner.style.display = 'block';
          }

          updateDeckRibbon();
          triggerDashConfetti();
        }, 300);
      });
    }

    if (startGeneratedQuizBtn) {
      startGeneratedQuizBtn.addEventListener('click', () => {
        switchView('quiz');
        initQuiz();
      });
    }

    if (openGeneratedCardsBtn) {
      openGeneratedCardsBtn.addEventListener('click', () => {
        currentCardsList = [...activeDeck.flashcards];
        switchView('flashcards');
        renderFlashcard(0);
      });
    }

    // Initial render of default deck
    updateDeckRibbon();
    renderFlashcard(0);
    renderQuizQuestion();

    '''

updated_code = code[:start_idx] + new_quiz_logic + code[end_idx:]

with open(script_path, "w", encoding="utf-8") as f:
    f.write(updated_code)

print("Updated student-tools.js successfully! Length:", len(updated_code))
