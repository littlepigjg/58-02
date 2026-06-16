const VideoUtils = (() => {

    const EMAIL_CLIENT_PATTERNS = [
        { name: 'Outlook Desktop', pattern: /Outlook/i, supportsVideo: false, supportsAutoplay: false },
        { name: 'Outlook Web', pattern: /Outlook/i, supportsVideo: true, supportsAutoplay: false },
        { name: 'Gmail', pattern: /Gmail/i, supportsVideo: true, supportsAutoplay: false },
        { name: 'Yahoo Mail', pattern: /Yahoo/i, supportsVideo: true, supportsAutoplay: false },
        { name: 'Apple Mail', pattern: /Apple Mail|Macintosh.*Mail/i, supportsVideo: true, supportsAutoplay: false },
        { name: 'iOS Mail', pattern: /iPhone|iPad|iPod.*Mail/i, supportsVideo: true, supportsAutoplay: false },
        { name: 'Thunderbird', pattern: /Thunderbird/i, supportsVideo: true, supportsAutoplay: true }
    ];

    function parseYoutubeUrl(url) {
        if (!url) return null;
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/i,
            /youtube\.com\/watch\?.*v=([^&\s]+)/i
        ];
        for (let i = 0; i < patterns.length; i++) {
            const match = url.match(patterns[i]);
            if (match) {
                return {
                    videoId: match[1],
                    embedUrl: 'https://www.youtube.com/embed/' + match[1],
                    watchUrl: 'https://www.youtube.com/watch?v=' + match[1],
                    thumbnail: 'https://img.youtube.com/vi/' + match[1] + '/maxresdefault.jpg'
                };
            }
        }
        return null;
    }

    function getYoutubeEmbedUrl(videoId, autoplay, loop) {
        let params = [];
        if (autoplay) params.push('autoplay=1');
        if (loop) params.push('loop=1&playlist=' + videoId);
        params.push('rel=0');
        params.push('modestbranding=1');
        return 'https://www.youtube.com/embed/' + videoId + '?' + params.join('&');
    }

    function detectEmailClient(userAgent) {
        const ua = userAgent || navigator.userAgent;
        for (let i = 0; i < EMAIL_CLIENT_PATTERNS.length; i++) {
            if (EMAIL_CLIENT_PATTERNS[i].pattern.test(ua)) {
                return EMAIL_CLIENT_PATTERNS[i];
            }
        }
        return { name: 'Unknown', supportsVideo: true, supportsAutoplay: false };
    }

    function getVideoWatchUrl(blockData) {
        if (blockData.sourceType === 'youtube') {
            const parsed = parseYoutubeUrl(blockData.youtubeUrl);
            return parsed ? parsed.watchUrl : blockData.youtubeUrl;
        }
        return blockData.videoUrl || '#';
    }

    function getPosterImage(blockData) {
        if (blockData.posterUrl) {
            return blockData.posterUrl;
        }
        if (blockData.sourceType === 'youtube') {
            const parsed = parseYoutubeUrl(blockData.youtubeUrl);
            if (parsed) return parsed.thumbnail;
        }
        return 'https://picsum.photos/600/340';
    }

    function generatePlayButtonOverlay(playButtonColor, buttonSize) {
        const size = buttonSize || 80;
        const color = playButtonColor || '#ffffff';
        const shadowColor = 'rgba(0,0,0,0.4)';
        const bgColor = 'rgba(0,0,0,0.6)';

        return '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;">' +
            '<div style="width:' + size + 'px;height:' + size + 'px;background:' + bgColor + ';border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px ' + shadowColor + ';">' +
                '<svg width="' + (size * 0.5) + '" height="' + (size * 0.5) + '" viewBox="0 0 24 24" fill="' + color + '">' +
                    '<path d="M8 5v14l11-7z"/>' +
                '</svg>' +
            '</div>' +
        '</div>';
    }

    function renderVideoFallback(blockData, options) {
        options = options || {};
        const poster = escapeHtml(getPosterImage(blockData));
        const watchUrl = escapeHtml(getVideoWatchUrl(blockData));
        const width = blockData.width || 100;
        const align = blockData.align || 'center';
        const style = paddingStyle(blockData);

        let imageHtml = '';
        if (blockData.fallbackMode === 'gif' && options.gifUrl) {
            imageHtml = '<img src="' + escapeHtml(options.gifUrl) + '" alt="视频预览" style="display:block;max-width:100%;width:' + width + '%;height:auto;border:0;outline:none;" width="' + width + '%" />';
        } else {
            imageHtml = '<div style="position:relative;display:inline-block;max-width:' + width + '%;width:' + width + '%;">' +
                '<img src="' + poster + '" alt="视频封面" style="display:block;max-width:100%;width:100%;height:auto;border:0;outline:none;" />' +
                generatePlayButtonOverlay() +
            '</div>';
        }

        const linkHtml = '<a href="' + watchUrl + '" target="_blank" style="text-decoration:none;display:inline-block;">' + imageHtml + '</a>';

        return '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="' + style + '">' +
            '<tr><td align="' + align + '">' +
                linkHtml +
                '<div style="font-size:12px;color:#9ca3af;margin-top:8px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;">' +
                    '📹 点击图片在新窗口观看视频' +
                '</div>' +
            '</td></tr></table>';
    }

    function renderVideoPlayer(blockData, options) {
        options = options || {};
        const width = blockData.width || 100;
        const align = blockData.align || 'center';
        const poster = escapeHtml(getPosterImage(blockData));
        const autoplay = blockData.autoplay ? 'autoplay' : '';
        const loop = blockData.loop ? 'loop' : '';
        const muted = blockData.autoplay ? 'muted' : '';
        const playsinline = 'playsinline';
        const style = paddingStyle(blockData);

        let videoSource = '';
        if (blockData.sourceType === 'youtube') {
            const parsed = parseYoutubeUrl(blockData.youtubeUrl);
            if (parsed) {
                const embedUrl = getYoutubeEmbedUrl(parsed.videoId, blockData.autoplay, blockData.loop);
                return '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="' + style + '">' +
                    '<tr><td align="' + align + '">' +
                        '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:' + width + '%;width:' + width + '%;display:inline-block;">' +
                            '<iframe src="' + escapeHtml(embedUrl) + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
                        '</div>' +
                    '</td></tr></table>';
            }
        } else if (blockData.sourceType === 'mp4' && blockData.videoUrl) {
            videoSource = '<source src="' + escapeHtml(blockData.videoUrl) + '" type="video/mp4">';
        }

        if (!videoSource) {
            return renderVideoFallback(blockData, options);
        }

        return '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="' + style + '">' +
            '<tr><td align="' + align + '">' +
                '<video controls ' + autoplay + ' ' + loop + ' ' + muted + ' ' + playsinline +
                    ' poster="' + poster + '" style="display:block;max-width:100%;width:' + width + '%;height:auto;border:0;outline:none;" width="' + width + '%" class="email-video-player">' +
                    videoSource +
                    '您的浏览器不支持视频播放。 <a href="' + escapeHtml(getVideoWatchUrl(blockData)) + '" target="_blank">点击这里观看</a>' +
                '</video>' +
            '</td></tr></table>';
    }

    function getVideoPolyfill() {
        return `
(function() {
    function initEmailVideoPlayers() {
        var ua = navigator.userAgent || '';
        var isOutlookDesktop = /Outlook/i.test(ua) && /Windows/i.test(ua);
        var isOldClient = /MSIE|Trident/i.test(ua);

        if (isOutlookDesktop || isOldClient) {
            var videos = document.querySelectorAll('video.email-video-player');
            for (var i = 0; i < videos.length; i++) {
                var video = videos[i];
                var poster = video.getAttribute('poster') || '';
                var sources = video.querySelectorAll('source');
                var watchUrl = '#';
                for (var j = 0; j < sources.length; j++) {
                    if (sources[j].getAttribute('src')) {
                        watchUrl = sources[j].getAttribute('src');
                        break;
                    }
                }

                var fallback = document.createElement('div');
                fallback.innerHTML = '<a href="' + watchUrl + '" target="_blank" style="display:inline-block;position:relative;">' +
                    '<img src="' + poster + '" alt="视频" style="display:block;max-width:100%;height:auto;" />' +
                    '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;background:rgba(0,0,0,0.6);border-radius:50%;display:flex;align-items:center;justify-content:center;">' +
                        '<svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>' +
                    '</div>' +
                '</a>';
                video.parentNode.replaceChild(fallback.firstChild, video);
            }
            return;
        }

        var videos = document.querySelectorAll('video.email-video-player');
        for (var i = 0; i < videos.length; i++) {
            (function(video) {
                var attempts = 0;
                function tryAutoplay() {
                    attempts++;
                    if (attempts > 5) return;

                    var promise = video.play();
                    if (promise && typeof promise.catch === 'function') {
                        promise.catch(function() {
                            video.muted = true;
                            return video.play().catch(function() {
                                setTimeout(tryAutoplay, 1000);
                            });
                        });
                    }
                }

                if (video.hasAttribute('autoplay')) {
                    video.addEventListener('canplay', function() {
                        setTimeout(tryAutoplay, 500);
                    });
                }

                video.addEventListener('error', function() {
                    var poster = video.getAttribute('poster') || '';
                    var fallback = document.createElement('div');
                    fallback.innerHTML = '<a href="' + (video.currentSrc || '#') + '" target="_blank">' +
                        '<img src="' + poster + '" alt="视频" style="display:block;max-width:100%;height:auto;" />' +
                    '</a>';
                    video.parentNode.replaceChild(fallback.firstChild, video);
                });
            })(videos[i]);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmailVideoPlayers);
    } else {
        initEmailVideoPlayers();
    }
})();`;
    }

    function getCompatibilityWarning(blockData) {
        const warnings = [];
        const client = detectEmailClient();

        if (blockData.autoplay && !client.supportsAutoplay) {
            warnings.push('⚠️ ' + client.name + ' 可能会阻止视频自动播放');
        }

        if (!client.supportsVideo) {
            warnings.push('⚠️ ' + client.name + ' 不支持内嵌视频，将使用降级方案');
        }

        if (blockData.sourceType === 'mp4' && !blockData.videoUrl) {
            warnings.push('⚠️ 请上传MP4文件或填写视频地址');
        }

        if (blockData.sourceType === 'youtube' && !blockData.youtubeUrl) {
            warnings.push('⚠️ 请填写YouTube链接');
        }

        return warnings;
    }

    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function paddingStyle(d) {
        return 'padding: ' + (d.paddingTop || 0) + 'px ' + (d.paddingRight || 0) + 'px ' + (d.paddingBottom || 0) + 'px ' + (d.paddingLeft || 0) + 'px;';
    }

    function readFileAsDataUrl(file) {
        return new Promise(function(resolve, reject) {
            if (!file) {
                reject(new Error('没有选择文件'));
                return;
            }
            var reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.onerror = function() {
                reject(new Error('读取文件失败'));
            };
            reader.readAsDataURL(file);
        });
    }

    return {
        parseYoutubeUrl: parseYoutubeUrl,
        getYoutubeEmbedUrl: getYoutubeEmbedUrl,
        detectEmailClient: detectEmailClient,
        getVideoWatchUrl: getVideoWatchUrl,
        getPosterImage: getPosterImage,
        renderVideoFallback: renderVideoFallback,
        renderVideoPlayer: renderVideoPlayer,
        getVideoPolyfill: getVideoPolyfill,
        getCompatibilityWarning: getCompatibilityWarning,
        readFileAsDataUrl: readFileAsDataUrl,
        escapeHtml: escapeHtml
    };
})();
