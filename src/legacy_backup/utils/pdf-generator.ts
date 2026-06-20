import { saveAs } from 'file-saver';

/**
 * Generates and downloads a Lyka-styled PDF summary using pdfmake and file-saver.
 */
export const generateLykaPDF = async (
    title: string,
    date: string,
    content: string
): Promise<string> => {
    try {
        console.log("Starting PDF generation with pdfmake...");

        // Dynamic imports to prevent Next.js SSR issues
        const [pdfMakeModule, pdfFontsModule] = await Promise.all([
            import('pdfmake/build/pdfmake'),
            import('pdfmake/build/vfs_fonts')
        ]);

        const pdfMake = (pdfMakeModule as any).default || (pdfMakeModule as any);
        const pdfFonts = (pdfFontsModule as any).default || (pdfFontsModule as any);
        const standardPdfFonts = {
            Helvetica: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
            }
        };
        let defaultFont = 'Helvetica';

        // Support pdfmake vfs_fonts export variants across versions/bundlers.
        const resolvedVfs =
            pdfFonts?.pdfMake?.vfs ||
            pdfFonts?.vfs ||
            pdfFontsModule?.vfs ||
            (pdfFonts && pdfFonts['Roboto-Regular.ttf'] ? pdfFonts : undefined);

        if (resolvedVfs) {
            if (typeof (pdfMake as any).addVirtualFileSystem === 'function') {
                (pdfMake as any).addVirtualFileSystem(resolvedVfs);
            } else {
                (pdfMake as any).vfs = resolvedVfs;
            }

            const robotoFonts = {
                Roboto: {
                    normal: 'Roboto-Regular.ttf',
                    bold: 'Roboto-Medium.ttf',
                    italics: 'Roboto-Italic.ttf',
                    bolditalics: 'Roboto-MediumItalic.ttf'
                }
            };

            if (typeof (pdfMake as any).addFonts === 'function') {
                (pdfMake as any).addFonts(robotoFonts);
            } else {
                (pdfMake as any).fonts = robotoFonts;
            }

            defaultFont = 'Roboto';
        } else {
            if (typeof (pdfMake as any).addFonts === 'function') {
                (pdfMake as any).addFonts(standardPdfFonts);
            } else {
                (pdfMake as any).fonts = standardPdfFonts;
            }
            console.warn('Could not resolve PDFMake VFS fonts. Falling back to Helvetica.');
        }

        const COLORS = {
            dark: '#050508',
            indigo: '#6366f1',
            white: '#ffffff',
            body: '#373737',
            muted: '#969696'
        };

        const docDefinition: any = {
            pageSize: 'A4',
            pageMargins: [40, 70, 40, 60],
            defaultStyle: {
                font: defaultFont
            },
            header: (currentPage: number) => {
                if (currentPage === 1) {
                    return {
                        stack: [
                            {
                                canvas: [
                                    {
                                        type: 'rect',
                                        x: 0,
                                        y: 0,
                                        w: 595.28,
                                        h: 42,
                                        color: COLORS.dark
                                    }
                                ]
                            },
                            {
                                columns: [
                                    {
                                        text: 'LYKA SYSTEM INTELLIGENCE',
                                        color: COLORS.indigo,
                                        fontSize: 14,
                                        bold: true,
                                        margin: [40, -30, 0, 0]
                                    },
                                    {
                                        text: `DATE ID: ${date.toUpperCase()}`,
                                        color: COLORS.white,
                                        fontSize: 8,
                                        alignment: 'right',
                                        margin: [0, -28, 40, 0]
                                    }
                                ]
                            }
                        ]
                    };
                }
                return {
                    stack: [
                        {
                            canvas: [
                                {
                                    type: 'rect',
                                    x: 0,
                                    y: 0,
                                    w: 595.28,
                                    h: 18,
                                    color: COLORS.dark
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    text: `CONTINUED: ${title.toUpperCase()}`,
                                    color: COLORS.white,
                                    fontSize: 7,
                                    margin: [40, -14, 0, 0]
                                },
                                {
                                    text: 'LYKA SYSTEM INTELLIGENCE',
                                    color: COLORS.white,
                                    fontSize: 7,
                                    alignment: 'right',
                                    margin: [0, -14, 40, 0]
                                }
                            ]
                        }
                    ]
                };
            },
            footer: (currentPage: number, pageCount: number) => {
                return {
                    stack: [
                        {
                            text: 'CONFIDENTIAL — LYKA AUTONOMOUS NETWORKS — INTERNAL ONLY',
                            color: COLORS.muted,
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 20, 0, 0]
                        },
                        {
                            text: `Page ${currentPage} of ${pageCount}`,
                            color: COLORS.muted,
                            fontSize: 6,
                            alignment: 'right',
                            margin: [0, -6, 40, 0]
                        }
                    ]
                };
            },
            content: [
                {
                    text: title.toUpperCase(),
                    style: 'header',
                    margin: [0, 40, 0, 5]
                },
                {
                    canvas: [
                        {
                            type: 'line',
                            x1: 0, y1: 0,
                            x2: 515, y2: 0,
                            lineWidth: 0.5,
                            lineColor: COLORS.indigo
                        }
                    ],
                    margin: [0, 0, 0, 20]
                },
                {
                    text: content,
                    style: 'body'
                }
            ],
            styles: {
                header: {
                    fontSize: 16,
                    bold: true,
                    color: COLORS.dark
                },
                body: {
                    fontSize: 10,
                    color: COLORS.body,
                    lineHeight: 1.5
                }
            }
        };

        // Extremely Robust FileName Sanitization (Alphanumeric only)
        const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').toUpperCase().substring(0, 40);
        const filename = `LYKA_SUMMARY_${safeTitle || 'REPORT'}.pdf`;

        // Generate and download (supports pdfmake callback and Promise APIs)
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);

        if (pdfDocGenerator.getBlob.length === 0) {
            const blob = await pdfDocGenerator.getBlob();
            if (!blob) {
                throw new Error('PDF blob was not generated.');
            }
            saveAs(blob, filename);
            console.log(`PDF Download Success: ${filename}`);
            return filename;
        }

        await new Promise<void>((resolve, reject) => {
            pdfDocGenerator.getBlob((blob: Blob) => {
                if (!blob) {
                    reject(new Error('PDF blob was not generated.'));
                    return;
                }
                saveAs(blob, filename);
                console.log(`PDF Download Success: ${filename}`);
                resolve();
            });
        });

        return filename;

    } catch (err) {
        console.error("Critical Failure in generateLykaPDF:", err);
        throw err;
    }
};