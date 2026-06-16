const TemplateEngine = (() => {

    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function paddingStyle(d) {
        return 'padding: ' + (d.paddingTop || 0) + 'px ' + (d.paddingRight || 0) + 'px ' + (d.paddingBottom || 0) + 'px ' + (d.paddingLeft || 0) + 'px;';
    }

    function renderHeading(block) {
        var d = block.data;
        var tag = 'h' + (d.level || 1);
        var align = d.align || 'center';
        var fontSize = d.fontSize || 28;
        var color = d.color || '#1f2937';
        var fontWeight = d.fontWeight || 'bold';
        var text = escapeHtml(d.text);
        var style = paddingStyle(d);

        return '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="' + style + '">' +
            '<tr><td align="' + align + '">' +
                '<' + tag + ' style="margin:0;font-size:' + fontSize + 'px;color:' + color + ';font-weight:' + fontWeight + ';line-height:1.3;font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif;">' + text + '</' + tag + '>' +
            '</td></tr></table>';
    }

    function renderParagraph(block) {
        var d = block.data;
        var align = d.align || 'left';
        var fontSize = d.fontSize || 14;
        var lineHeight = d.lineHeight || 1.6;
        var color = d.color || '#4b5563';
        var text = escapeHtml(d.text).replace(/\n/g, '<br>');
        var style = paddingStyle(d);

        return '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="' + style + '">' +
            '<tr><td align="' + align + '">' +
                '<p style="margin:0;font-size:' + fontSize + 'px;line-height:' + lineHeight + ';color:' + color + ';font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif;">' + text + '</p>' +
            '</td></tr></table>';
    }

    function renderImage(block) {
        var d = block.data;
        var align = d.align || 'center';
        var width = d.width || 100;
        var src = escapeHtml(d.src);
        var alt = escapeHtml(d.alt || '');
        var href = d.href ? escapeHtml(d.href) : '';
        var style = paddingStyle(d);

        var imgHtml = '<img src="' + src + '" alt="' + alt + '" style="display:block;max-width:100%;width:' + width + '%;height:auto;border:0;outline:none;text-decoration:none;" width="' + width + '%" />';
        if (href) {
            imgHtml = '<a href="' + href + '" target="_blank" style="text-decoration:none;">' + imgHtml + '</a>';
        }

        return '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="' + style + '">' +
            '<tr><td align="' + align + '">' + imgHtml + '</td></tr></table>';
    }

    function renderButton(block) {
        var d = block.data;
        var bgColor = d.backgroundColor || '#667eea';
        var textColor = d.color || '#ffffff';
        var borderRadius = d.borderRadius || 6;
        var padV = d.paddingVertical || 12;
        var padH = d.paddingHorizontal || 28;
        var fontSize = d.fontSize || 15;
        var fontWeight = d.fontWeight || 'bold';
        var btnHref = escapeHtml(d.href || '#');
        var btnText = escapeHtml(d.text);
        var align = d.align || 'center';
        var style = paddingStyle(d);

        return '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="' + style + '">' +
            '<tr><td align="' + align + '">' +
                '<table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate !important;">' +
                    '<tr><td style="border-radius:' + borderRadius + 'px;background-color:' + bgColor + ';">' +
                        '<a href="' + btnHref + '" target="_blank" style="display:inline-block;padding:' + padV + 'px ' + padH + 'px;border-radius:' + borderRadius + 'px;background:' + bgColor + ';color:' + textColor + ';text-decoration:none;font-size:' + fontSize + 'px;font-weight:' + fontWeight + ';font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif;">' + btnText + '</a>' +
                    '</td></tr>' +
                '</table>' +
            '</td></tr></table>';
    }

    function renderDivider(block) {
        var d = block.data;
        var lineStyle = d.style || 'solid';
        var color = d.color || '#e5e7eb';
        var thickness = d.thickness || 1;
        var width = d.width || 100;
        var style = paddingStyle(d);

        return '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="' + style + '">' +
            '<tr><td align="center">' +
                '<table border="0" cellpadding="0" cellspacing="0" width="' + width + '%">' +
                    '<tr><td style="border-top:' + thickness + 'px ' + lineStyle + ' ' + color + ';font-size:1px;line-height:1px;">&nbsp;</td></tr>' +
                '</table>' +
            '</td></tr></table>';
    }

    function renderColumns(block) {
        var d = block.data;
        var columns = d.columns || 2;
        var widthPct = Math.floor(100 / columns);
        var style = paddingStyle(d);
        var columnsHtml = '';

        for (var i = 0; i < columns; i++) {
            var col = d.children[i];
            var innerContent = '';
            if (col && col.blocks && col.blocks.length > 0) {
                innerContent = col.blocks.map(function(b) { return renderBlock(b); }).join('\n');
            }
            columnsHtml += '<td valign="top" width="' + widthPct + '%" style="width:' + widthPct + '%;">' +
                '<table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                    innerContent +
                '</table></td>';
        }

        return '<!--[if mso]>' +
            '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr>' +
            '<![endif]-->' +
            '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="' + style + '">' +
                '<tr><td>' +
                    '<table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                        '<tr>' + columnsHtml + '</tr>' +
                    '</table>' +
                '</td></tr>' +
            '</table>' +
            '<!--[if mso]>' +
            '</tr></table>' +
            '<![endif]-->';
    }

    function renderVideo(block) {
        var d = block.data;
        return VideoUtils.renderVideoPlayer(d, {});
    }

    function renderBlock(block) {
        switch (block.type) {
            case 'heading': return renderHeading(block);
            case 'paragraph': return renderParagraph(block);
            case 'image': return renderImage(block);
            case 'button': return renderButton(block);
            case 'divider': return renderDivider(block);
            case 'columns': return renderColumns(block);
            case 'video': return renderVideo(block);
            default: return '';
        }
    }

    function renderBody(blocks) {
        return blocks.map(function(b) { return renderBlock(b); }).join('\n');
    }

    function renderFullHtml(blocks, options) {
        options = options || {};
        var bodyContent = renderBody(blocks);
        var bgColor = options.backgroundColor || '#f3f4f6';
        var contentBgColor = options.contentBgColor || '#ffffff';
        var title = options.title || '邮件模板';
        var year = new Date().getFullYear();
        var hasVideo = blocks.some(function(b) { return b.type === 'video'; });
        var videoPolyfill = hasVideo ? VideoUtils.getVideoPolyfill() : '';

        var msoFallbackNotes = '';
        if (hasVideo) {
            msoFallbackNotes = '<!--[if mso]>\n' +
                '    <style type="text/css">\n' +
                '        video.email-video-player { display: none !important; }\n' +
                '    </style>\n' +
                '    <![endif]-->\n';
        }

        return '<!DOCTYPE html>\n' +
'<html lang="zh-CN" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">\n' +
'<head>\n' +
'    <meta charset="UTF-8">\n' +
'    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'    <meta name="format-detection" content="telephone=no">\n' +
'    <meta name="format-detection" content="date=no">\n' +
'    <meta name="format-detection" content="address=no">\n' +
'    <meta name="format-detection" content="email=no">\n' +
'    <title>' + title + '</title>\n' +
'    <!--[if mso]>\n' +
'    <xml>\n' +
'        <o:OfficeDocumentSettings>\n' +
'            <o:AllowPNG/>\n' +
'            <o:PixelsPerInch>96</o:PixelsPerInch>\n' +
'        </o:OfficeDocumentSettings>\n' +
'    </xml>\n' +
'    <![endif]-->\n' +
msoFallbackNotes +
'    <style type="text/css">\n' +
'        body { margin: 0 !important; padding: 0 !important; -webkit-text-size-adjust: 100% !important; -ms-text-size-adjust: 100% !important; -webkit-font-smoothing: antialiased !important; }\n' +
'        img { border: 0 !important; outline: none !important; text-decoration: none !important; display: block; }\n' +
'        table { border-collapse: collapse !important; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }\n' +
'        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }\n' +
'        .yshortcuts a { border-bottom: none !important; }\n' +
'        video.email-video-player { width: 100% !important; max-width: 100% !important; height: auto !important; }\n' +
'        @media only screen and (max-width: 600px) {\n' +
'            .mj-column-per-100 { width: 100% !important; max-width: 100% !important; }\n' +
'            table[class="mj-column-per-100"] { width: 100% !important; }\n' +
'            video.email-video-player { width: 100% !important; }\n' +
'        }\n' +
'    </style>\n' +
'</head>\n' +
'<body bgcolor="' + bgColor + '" style="margin:0;padding:0;background-color:' + bgColor + ';">\n' +
'    <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="' + bgColor + '" style="background-color:' + bgColor + ';">\n' +
'        <tr>\n' +
'            <td align="center" style="padding:20px 0;">\n' +
'                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">\n' +
'                    <tr>\n' +
'                        <td align="center" style="padding:0 10px;">\n' +
'                            <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="' + contentBgColor + '" style="background-color:' + contentBgColor + ';border-radius:8px;overflow:hidden;">\n' +
                                bodyContent + '\n' +
'                            </table>\n' +
'                        </td>\n' +
'                    </tr>\n' +
'                </table>\n' +
'                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">\n' +
'                    <tr>\n' +
'                        <td align="center" style="padding:20px 10px;font-size:12px;color:#9ca3af;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;">\n' +
'                            &copy; ' + year + ' 邮件模板 &nbsp;|&nbsp; 由邮件模板编辑器生成\n' +
'                        </td>\n' +
'                    </tr>\n' +
'                </table>\n' +
'            </td>\n' +
'        </tr>\n' +
'    </table>\n' +
(hasVideo ? '<script type="text/javascript">\n' + videoPolyfill + '\n</script>\n' : '') +
'</body>\n' +
'</html>';
    }

    function renderEditorBlock(block) {
        var d = block.data;
        switch (block.type) {
            case 'heading': {
                var tag = 'h' + (d.level || 1);
                return '<' + tag + ' style="margin:0;font-size:' + (d.fontSize || 28) + 'px;color:' + d.color + ';font-weight:' + d.fontWeight + ';text-align:' + d.align + ';line-height:1.3;">' + escapeHtml(d.text) + '</' + tag + '>';
            }
            case 'paragraph': {
                return '<p style="margin:0;font-size:' + (d.fontSize || 14) + 'px;line-height:' + d.lineHeight + ';color:' + d.color + ';text-align:' + d.align + ';">' + escapeHtml(d.text).replace(/\n/g, '<br>') + '</p>';
            }
            case 'image': {
                var imgHtml = '<img src="' + escapeHtml(d.src) + '" alt="' + escapeHtml(d.alt || '') + '" style="display:block;max-width:100%;width:' + d.width + '%;height:auto;" />';
                if (d.href) {
                    imgHtml = '<a href="' + escapeHtml(d.href) + '" target="_blank" style="text-decoration:none;">' + imgHtml + '</a>';
                }
                return '<div style="text-align:' + d.align + ';">' + imgHtml + '</div>';
            }
            case 'button': {
                return '<div style="text-align:' + d.align + ';"><span style="display:inline-block;padding:' + d.paddingVertical + 'px ' + d.paddingHorizontal + 'px;background:' + d.backgroundColor + ';color:' + d.color + ';text-decoration:none;font-size:' + d.fontSize + 'px;font-weight:' + d.fontWeight + ';border-radius:' + d.borderRadius + 'px;">' + escapeHtml(d.text) + '</span></div>';
            }
            case 'divider': {
                return '<div style="text-align:center;"><div style="display:inline-block;width:' + d.width + '%;border-top:' + d.thickness + 'px ' + d.style + ' ' + d.color + ';"></div></div>';
            }
            case 'columns': {
                var cols = d.columns || 2;
                var colsHtml = '';
                for (var i = 0; i < cols; i++) {
                    var child = d.children[i];
                    var inner = '';
                    if (child) {
                        inner = renderEditorBlock(child);
                    } else {
                        inner = '<p style="color:#9ca3af;text-align:center;">空栏</p>';
                    }
                    colsHtml += '<div class="mj-column" data-col-index="' + i + '">' + inner + '</div>';
                }
                return '<div class="mj-column-wrapper">' + colsHtml + '</div>';
            }
            case 'video': {
                var poster = VideoUtils.getPosterImage(d);
                var width = d.width || 100;
                var videoHtml = '';
                var placeholderHint = '';

                if (d.sourceType === 'youtube' && !d.youtubeUrl) {
                    placeholderHint = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;">请在右侧粘贴YouTube链接</div>';
                } else if (d.sourceType === 'mp4' && !d.videoUrl) {
                    placeholderHint = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;">请在右侧上传MP4文件</div>';
                }

                if (d.sourceType === 'youtube' && d.youtubeUrl) {
                    var parsed = VideoUtils.parseYoutubeUrl(d.youtubeUrl);
                    if (parsed) {
                        var embedUrl = VideoUtils.getYoutubeEmbedUrl(parsed.videoId, d.autoplay, d.loop);
                        videoHtml = '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:' + width + '%;width:' + width + '%;display:inline-block;">' +
                            '<iframe src="' + escapeHtml(embedUrl) + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
                        '</div>';
                    }
                } else if (d.sourceType === 'mp4' && d.videoUrl) {
                    var autoplayAttr = d.autoplay ? 'autoplay muted' : '';
                    var loopAttr = d.loop ? 'loop' : '';
                    videoHtml = '<video controls ' + autoplayAttr + ' ' + loopAttr + ' playsinline ' +
                        'poster="' + escapeHtml(poster) + '" style="display:block;max-width:100%;width:' + width + '%;height:auto;border-radius:8px;">' +
                        '<source src="' + escapeHtml(d.videoUrl) + '" type="video/mp4">' +
                        '您的浏览器不支持视频播放。' +
                    '</video>';
                }

                if (!videoHtml) {
                    videoHtml = '<div style="position:relative;display:inline-block;max-width:' + width + '%;width:' + width + '%;">' +
                        '<img src="' + escapeHtml(poster) + '" alt="视频封面" style="display:block;max-width:100%;width:100%;height:auto;border-radius:8px;opacity:0.6;" />' +
                        '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;background:rgba(0,0,0,0.6);border-radius:50%;display:flex;align-items:center;justify-content:center;">' +
                            '<svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff"><path d="M8 5v14l11-7z"/></svg>' +
                        '</div>' +
                        placeholderHint +
                    '</div>';
                }

                var warnings = VideoUtils.getCompatibilityWarning(d);
                var warningHtml = '';
                if (warnings.length > 0) {
                    warningHtml = '<div style="margin-top:8px;padding:8px 12px;background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;font-size:12px;color:#92400e;">' +
                        warnings.map(function(w) { return '<div style="margin-bottom:4px;">' + w + '</div>'; }).join('') +
                    '</div>';
                }

                return '<div style="text-align:' + d.align + ';">' + videoHtml + warningHtml + '</div>';
            }
            default:
                return '';
        }
    }

    return {
        renderFullHtml: renderFullHtml,
        renderBody: renderBody,
        renderBlock: renderBlock,
        renderEditorBlock: renderEditorBlock
    };
})();
