// Enhanced showResult function with scoring and sharing
function showResult(success) {
    // Check for legendary (0.7% chance on success)
    const isLegendary = success && Math.random() < 0.007;
    
    // Select joke
    let joke;
    if (isLegendary) {
        joke = CONFIG.jokes.legendary[Math.floor(Math.random() * CONFIG.jokes.legendary.length)];
    } else {
        const list = success ? CONFIG.jokes.success : CONFIG.jokes.fail;
        joke = list[Math.floor(Math.random() * list.length)];
    }
    
    // Generate nose score (weighted by success and nose detection)
    let score;
    if (isLegendary) {
        score = 10.0;
    } else if (success) {
        score = nosePosition 
            ? (8.0 + Math.random() * 2.0) // 8.0-10.0 if nose detected
            : (7.0 + Math.random() * 2.0); // 7.0-9.0 otherwise
    } else {
        score = 3.0 + Math.random() * 4.0; // 3.0-7.0 for failures
    }
    score = Math.round(score * 10) / 10; // Round to 1 decimal
    
    // Select random nose type
    const noseType = CONFIG.noseTypes[Math.floor(Math.random() * CONFIG.noseTypes.length)];
    
    // Add shake animation for failures
    if (!success) {
        scannerTarget.classList.add('shake');
        setTimeout(() => scannerTarget.classList.remove('shake'), 500);
    }
    
    // Update modal content
    resultModal.classList.add('visible');
    modalIcon.textContent = isLegendary ? "🏆" : (success ? "✅" : "❌");
    modalTitle.textContent = isLegendary ? "LEGENDARY!" : (success ? "Nose Verified!" : "Scan Failed");
    modalJoke.textContent = joke;
    
    // Animate score counter
    animateScore(score);
    
    // Update nose type
    document.querySelector('.type-emoji').textContent = noseType.emoji;
    document.querySelector('.type-name').textContent = noseType.name;
    document.querySelector('.type-desc').textContent = noseType.description;
    
    // Store result for sharing
    window.lastResult = {
        success,
        isLegendary,
        score,
        noseType,
        joke
    };
    
    if (success) {
        startConfetti();
        playSound('success');
    } else {
        playSound('fail');
    }
    
    scanBtn.disabled = false;
}

// Animate score counter from 0 to target
function animateScore(targetScore) {
    const scoreElement = document.getElementById('noseScore');
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentScore = eased * targetScore;
        
        scoreElement.textContent = currentScore.toFixed(1);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// Share result functionality
function shareResult() {
    const result = window.lastResult;
    if (!result) return;
    
    const shareText = `I scanned my nose on Nose Scanner 3000 👃\n\nResult: ${result.isLegendary ? "🏆 LEGENDARY" : (result.success ? "✅ Verified" : "❌ Failed")}\nScore: ${result.score}/10\nType: ${result.noseType.emoji} ${result.noseType.name}\n\n"${result.joke}"\n\nTry it yourself!`;
    
    // Try native share API first
    if (navigator.share) {
        navigator.share({
            title: 'My Nose Scan Result',
            text: shareText
        }).catch(err => console.log('Share cancelled'));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            const shareBtn = document.getElementById('shareBtn');
            const originalText = shareBtn.textContent;
            shareBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                shareBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            alert('Could not copy to clipboard');
        });
    }
}
