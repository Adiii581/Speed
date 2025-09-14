import React, { useState, useRef, useEffect } from 'react';
import Peer from 'peerjs';
import JSZip from 'jszip';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Progress } from './components/ui/progress';
import { Label } from './components/ui/label';
import { Alert, AlertDescription } from './components/ui/alert';
import { Download, Send, Upload, Copy, Check } from 'lucide-react';
import AnimatedBackground from './components/AnimatedBackground';

export default function App() {
  const [roomId, setRoomId] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [receiverId, setReceiverId] = useState('');
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string>('Initializing...');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [receivedFileName, setReceivedFileName] = useState<string>('received-file');
  const [autoDownload, setAutoDownload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const peerInstance = useRef<Peer | null>(null);

  useEffect(() => {
    // Generate a shorter, simpler room ID
    const generateSimpleId = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const customId = generateSimpleId();
    
    // Set our custom room ID immediately
    setRoomId(customId);
    
    const peer = new Peer(customId, {
      host: 'speed-project-v2.onrender.com',
      path: '/myapp',
      secure: true
    });

    peer.on('open', (id) => {
      // Verify our custom ID was accepted, otherwise use what PeerJS gave us
      if (id !== customId) {
        console.warn('PeerJS overrode our custom ID:', customId, '-> ', id);
        setRoomId(id);
      }
      setStatus("Connected and ready");
    });

    peer.on('connection', (conn) => {
      setStatus('Peer connected! Receiving file(s)...');
      setIsTransferring(true);
      setTransferProgress(0);

      let fileChunks: ArrayBuffer[] = [];
      let metadata: { name: string, type: string, size: number } | null = null;
      let receivedSize = 0;

      conn.on('data', (data: any) => {
        if (data.type === 'metadata') {
          metadata = data.payload;
          setReceivedFileName(metadata!.name);
        } else if (data instanceof ArrayBuffer) {
          fileChunks.push(data);
          receivedSize += data.byteLength;
          
          if (metadata) {
            const progress = Math.min(Math.round((receivedSize / metadata.size) * 100), 100);
            setTransferProgress(progress);
          }
        } else if (data.type === 'end') {
          if (!metadata) {
            setStatus('Error: Received file without metadata.');
            setIsTransferring(false);
            return;
          }
          const fileBlob = new Blob(fileChunks, { type: metadata.type });
          setDownloadUrl(URL.createObjectURL(fileBlob));
          
          // Reset for next transfer
          fileChunks = []; 
          metadata = null;
          receivedSize = 0;

          setStatus('Files received successfully');
          setIsTransferring(false);
          setTransferComplete(true);
        }
      });
    });

    peer.on('error', (err) => {
      setStatus(`Error: ${err.message}`);
      console.error(err);
    });

    peerInstance.current = peer;
    return () => { peer.destroy(); };
  }, []);

  // Auto-download effect for Enter key transfers
  useEffect(() => {
    if (transferComplete && downloadUrl && autoDownload) {
      // Small delay to let the UI update, then auto-download
      const timer = setTimeout(() => {
        handleDownload();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [transferComplete, downloadUrl, autoDownload]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    if (files.length > 0) {
      setStatus(`${files.length} file(s) selected.`);
    }
  };

  const handleSend = async () => {
    if (selectedFiles.length === 0 || !receiverId.trim()) return;

    let fileToSend: File;
    if (selectedFiles.length > 1) {
      setStatus("Zipping files...");
      const zip = new JSZip();
      selectedFiles.forEach(file => zip.file(file.name, file));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      fileToSend = new File([zipBlob], "speed-transfer.zip", { type: "application/zip" });
    } else {
      fileToSend = selectedFiles[0];
    }

    if (receiverId === roomId) {
      // This local transfer logic remains the same
      setStatus("Processing local file(s)...");
      setIsTransferring(true);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setTransferProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          const blob = new Blob([fileToSend], { type: fileToSend.type });
          setReceivedFileName(fileToSend.name);
          setDownloadUrl(URL.createObjectURL(blob));
          setStatus("Local transfer completed");
          setIsTransferring(false);
          setTransferComplete(true);
        }
      }, 200);
      return;
    }

    const conn = peerInstance.current?.connect(receiverId);
    if (!conn) {
      setStatus('Error: Could not connect to peer ID.');
      return;
    }

    conn.on('open', () => {
      setStatus(`Sending: ${fileToSend.name}`);
      setIsTransferring(true);
      setTransferProgress(0);

      fileToSend.arrayBuffer().then(buffer => {
        const CHUNK_SIZE = 64 * 1024; // 64KB chunks

        // 1. Send metadata first
        conn.send({
          type: 'metadata',
          payload: {
            name: fileToSend.name,
            type: fileToSend.type,
            size: buffer.byteLength,
          }
        });

        // 2. Send the file in chunks
        let offset = 0;
        const sendChunk = () => {
          if (offset < buffer.byteLength) {
            const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
            conn.send(chunk);
            offset += CHUNK_SIZE;
            
            const progress = Math.min(Math.round((offset / buffer.byteLength) * 100), 100);
            setTransferProgress(progress);

            // Use a small timeout to allow the network to handle the data
            setTimeout(sendChunk, 5); 
          } else {
            // 3. Signal end of transfer
            conn.send({ type: 'end' });
            setStatus('Files sent successfully');
            setIsTransferring(false);
          }
        };
        sendChunk();

      }).catch(err => {
        setStatus(`Error reading file: ${err.message}`);
        setIsTransferring(false);
      });
    });

    conn.on('error', (err) => {
      setStatus(`Connection error: ${err}`);
      setIsTransferring(false);
    });
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = receivedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Reset state after download to show main UI again
      setTransferComplete(false);
      setTransferProgress(0);
      setDownloadUrl('');
      setReceiverId('');
      setSelectedFiles([]);
      setAutoDownload(false);
      setStatus("Connected and ready");
    }
  };

  const handleReceiverIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiverId(e.target.value);
    if (downloadUrl && transferComplete) {
      setDownloadUrl('');
      setReceivedFileName('received-file');
      setTransferComplete(false);
      setTransferProgress(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && selectedFiles.length > 0 && receiverId.trim() && !isTransferring) {
      setAutoDownload(true);
      handleSend();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };



  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Header */}
      <div className="relative z-10 pt-8 pb-4 px-6">
        <h1 className="text-6xl font-bold text-foreground">Speed</h1>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 text-center pt-8 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-4xl md:text-5xl font-light text-foreground mb-6 leading-relaxed tracking-wide">
            Transfer files at
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 font-medium ml-3">
              lightning speed
            </span>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light mb-4">
            Speed lets you transfer files instantly between devices 
            with just a room ID. No signup, no limits, no hassle.
          </p>
          {status && 
           !status.includes("Connected and ready") && 
           !status.includes("Files sent successfully") && 
           !status.includes("Local transfer completed") &&
           !status.includes("file(s) selected.") && (
            <div className="max-w-2xl mx-auto">
              <p className="text-base text-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/40">
                {status}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-8 relative z-10 px-6 pb-12">
        {/* Room ID Display - Hidden when download is ready */}
        {!(transferComplete && downloadUrl) && (
        <div className="space-y-3 bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
          <Label htmlFor="room-id" className="text-lg text-foreground">Your Room ID</Label>
          <div className="flex gap-3">
            <Input
              id="room-id"
              value={roomId || 'Connecting...'}
              readOnly
              className="flex-1 bg-white border border-gray-200 text-foreground h-16 text-sm md:text-lg px-4 md:px-6 rounded-xl font-mono tracking-wide break-all"
            />
            <Button 
              onClick={handleCopy}
              disabled={!roomId}
              className="h-16 px-6 text-lg relative overflow-hidden rounded-xl disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, rgba(251, 146, 60, 0.9) 0%, rgba(234, 88, 12, 0.9) 50%, rgba(194, 65, 12, 0.9) 100%)`,
                color: 'white',
                border: 'none'
              }}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </Button>
          </div>
        </div>
        )}

        {/* File Selection - Hidden when download is ready */}
        {!(transferComplete && downloadUrl) && (
        <div className="space-y-3 bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
          <Label htmlFor="selected-files" className="text-lg text-foreground">Selected Files</Label>
          <div 
            className="min-h-[160px] p-8 bg-white border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-200 group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center text-center">
              {selectedFiles.length === 0 ? (
                <>
                  <Upload size={32} className="text-muted-foreground group-hover:text-orange-500 transition-colors mb-4" />
                  <span className="text-xl text-muted-foreground group-hover:text-orange-600 mb-3">
                    Click to select files
                  </span>
                  <span className="text-muted-foreground">No files selected</span>
                </>
              ) : (
                <div className="text-base text-foreground w-full">
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 text-left">
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        )}

        {/* Loading Progress */}
        {isTransferring && (
          <div className="space-y-3 bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
            <Label className="text-lg text-foreground">Transfer Progress</Label>
            <Progress value={transferProgress} className="w-full h-4 bg-gray-200" />
            <p className="text-base text-muted-foreground text-center">
              Transferring files... {transferProgress}%
            </p>
          </div>
        )}

        {/* Receiver ID Input - Hidden when download is ready */}
        {!(transferComplete && downloadUrl) && (
        <div className="space-y-3 bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
          <Label htmlFor="receiver-id" className="text-lg text-foreground">Receiver ID</Label>
          <div className="flex gap-4">
            <Input
              id="receiver-id"
              placeholder="Enter receiver's room ID and press Enter"
              value={receiverId}
              onChange={handleReceiverIdChange}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-white border border-gray-200 h-16 text-sm md:text-lg px-4 md:px-6 rounded-xl font-mono tracking-wide"
              disabled={isTransferring}
            />
            <Button 
              onClick={handleSend}
              disabled={selectedFiles.length === 0 || !receiverId.trim() || isTransferring}
              className="h-16 px-6 relative overflow-hidden rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              style={{
                background: `linear-gradient(135deg, rgba(251, 146, 60, 0.9) 0%, rgba(234, 88, 12, 0.9) 50%, rgba(194, 65, 12, 0.9) 100%)`,
                color: 'white',
                border: 'none'
              }}
            >
              <Send size={24} />
            </Button>
          </div>
        </div>
        )}

        {/* Download Button - Shows when transfer is complete */}
        {transferComplete && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
              <div className="text-center md:text-left pl-4 md:pl-6">
                <div className="text-green-800 text-xl font-semibold">Transfer completed successfully!</div>
                <div className="text-green-600 text-base">Your files are ready to download</div>
              </div>
              <div className="flex justify-center md:justify-end pr-4 md:pr-6">
                <Button 
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white h-16 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Download className="size-8" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Not sure where to start section - Hidden when download is ready */}
        {!(transferComplete && downloadUrl) && (
        <div className="text-center mt-16 pt-8 border-t border-white/30">
          <p className="text-xl text-muted-foreground mb-6">Not sure where to start? Try these:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="outline" 
              className="bg-white/50 border-white/60 text-foreground hover:bg-white/70 rounded-full px-6 py-3 text-lg backdrop-blur-sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files || []);
                  setSelectedFiles(files);
                };
                input.click();
              }}
            >
              Share Photos
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/50 border-white/60 text-foreground hover:bg-white/70 rounded-full px-6 py-3 text-lg backdrop-blur-sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.doc,.docx,.txt';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files || []);
                  setSelectedFiles(files);
                };
                input.click();
              }}
            >
              Send Documents
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/50 border-white/60 text-foreground hover:bg-white/70 rounded-full px-6 py-3 text-lg backdrop-blur-sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*,audio/*';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files || []);
                  setSelectedFiles(files);
                };
                input.click();
              }}
            >
              Transfer Media
            </Button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
