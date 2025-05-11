import {
  useGetChunkHighlights,
  useGetDocumentUrl,
} from '@/hooks/document-hooks';
import { IReferenceChunk } from '@/interfaces/database/chat';
import { IChunk } from '@/interfaces/database/knowledge';
import FileError from '@/pages/document-viewer/file-error';
import { Skeleton, message } from 'antd';
import axios from 'axios';
import mammoth from 'mammoth';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AreaHighlight,
  Highlight,
  IHighlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
} from 'react-pdf-highlighter';
import { useCatchDocumentError } from './hooks';

import styles from './index.less';

interface IProps {
  chunk: IChunk | IReferenceChunk;
  documentId: string;
  visible: boolean;
}

const HighlightPopup = ({
  comment,
}: {
  comment: { text: string; emoji: string };
}) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null;

// 更强健的文件类型检测
const getFileType = (url: string): 'pdf' | 'docx' | 'unknown' => {
  // 首先尝试从URL路径中获取扩展名
  const urlPathMatch = url.split('?')[0].match(/\.([^.]+)$/);
  if (urlPathMatch) {
    const ext = urlPathMatch[1].toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx' || ext === 'doc') return 'docx';
  }

  // 如果URL中包含文件类型参数
  if (url.includes('type=pdf')) return 'pdf';
  if (url.includes('type=docx') || url.includes('type=doc')) return 'docx';

  // 默认返回未知
  return 'unknown';
};

// DOCX预览组件
const DocxPreviewer = ({ url }: { url: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string>();
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchDocumentAsync = useCallback(async () => {
    try {
      console.log('Fetching DOCX file from:', url);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          // 添加必要的请求头
          'Accept': '*/*',
          'Cache-Control': 'no-cache',
        },
      });

      console.log('DOCX file fetched, converting to HTML...');

      mammoth
        .convertToHtml(
          { arrayBuffer: response.data },
          { includeDefaultStyleMap: true },
        )
        .then((result) => {
          console.log('DOCX conversion successful');
          setLoaded(true);
          const docEl = document.createElement('div');
          docEl.className = 'document-container';
          docEl.innerHTML = result.value;
          const container = containerRef.current;
          if (container) {
            container.innerHTML = docEl.outerHTML;
          }
        })
        .catch((err) => {
          console.error('DOCX conversion error:', err);
          setError(`转换DOCX文件失败: ${err.toString()}`);
          message.error('DOCX文件转换失败');
        });
    } catch (error: any) {
      console.error('DOCX fetch error:', error);
      setError(`获取DOCX文件失败: ${error.toString()}`);
      message.error('获取DOCX文件失败');
    }
  }, [url]);

  useEffect(() => {
    fetchDocumentAsync();
  }, [fetchDocumentAsync]);

  return (
    <div className={styles.docxContainer}>
      {!loaded && !error && <Skeleton active />}
      {error && <FileError>{error}</FileError>}
      <div ref={containerRef} className={styles.docxContent} />
    </div>
  );
};

const DocumentPreviewer = ({ chunk, documentId, visible }: IProps) => {
  const getDocumentUrl = useGetDocumentUrl(documentId);
  const { highlights: state, setWidthAndHeight } = useGetChunkHighlights(chunk);
  const ref = useRef<(highlight: IHighlight) => void>(() => {});
  const [loaded, setLoaded] = useState(false);
  const url = getDocumentUrl();
  const error = useCatchDocumentError(url);
  const [fileType, setFileType] = useState<'pdf' | 'docx' | 'unknown'>('unknown');

  const resetHash = () => {};

  // 检测文件类型
  useEffect(() => {
    if (url) {
      const detectedType = getFileType(url);
      console.log('Detected file type:', detectedType, 'for URL:', url);
      setFileType(detectedType);
    }
  }, [url]);

  useEffect(() => {
    setLoaded(visible);
  }, [visible]);

  useEffect(() => {
    if (state.length > 0 && loaded && fileType === 'pdf') {
      setLoaded(false);
      ref.current(state[0]);
    }
  }, [state, loaded, fileType]);

  // 如果文件类型未知，尝试先作为PDF加载
  const handlePdfLoadError = () => {
    if (fileType === 'unknown') {
      console.log('PDF loading failed, trying as DOCX');
      setFileType('docx');
    }
  };

  return (
    <div className={styles.documentContainer}>
      {fileType === 'docx' ? (
        <DocxPreviewer url={url} />
      ) : (
        <PdfLoader
          url={url}
          beforeLoad={<Skeleton active />}
          workerSrc="/pdfjs-dist/pdf.worker.min.js"
          errorMessage={<FileError>{error || '加载PDF文件失败'}</FileError>}
          onError={handlePdfLoadError}
        >
          {(pdfDocument) => {
            pdfDocument.getPage(1).then((page) => {
              const viewport = page.getViewport({ scale: 1 });
              const width = viewport.width;
              const height = viewport.height;
              setWidthAndHeight(width, height);
            });

            return (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={resetHash}
                scrollRef={(scrollTo) => {
                  ref.current = scrollTo;
                  setLoaded(true);
                }}
                onSelectionFinished={() => null}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo,
                ) => {
                  const isTextHighlight = !Boolean(
                    highlight.content && highlight.content.image,
                  );

                  const component = isTextHighlight ? (
                    <Highlight
                      isScrolledTo={isScrolledTo}
                      position={highlight.position}
                      comment={highlight.comment}
                    />
                  ) : (
                    <AreaHighlight
                      isScrolledTo={isScrolledTo}
                      highlight={highlight}
                      onChange={() => {}}
                    />
                  );

                  return (
                    <Popup
                      popupContent={<HighlightPopup {...highlight} />}
                      onMouseOver={(popupContent) =>
                        setTip(highlight, () => popupContent)
                      }
                      onMouseOut={hideTip}
                      key={index}
                    >
                      {component}
                    </Popup>
                  );
                }}
                highlights={state}
              />
            );
          }}
        </PdfLoader>
      )}
    </div>
  );
};

export default DocumentPreviewer;
