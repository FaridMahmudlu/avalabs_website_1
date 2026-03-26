import tkinter as tk
from tkinter import filedialog, scrolledtext, messagebox
import threading
import os
import cv2
import whisper
import requests 
import base64
import json
import math
from PIL import Image, ImageTk
from dotenv import load_dotenv

load_dotenv()
# --- AYARLAR ---
# API ANAHTARINI BURAYA YAPIŞTIR (Tırnaklar kalsın)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# KAÇ SANİYEDE BİR FOTOĞRAF ALINSIN? (Burayı değiştirebilirsin)

SANIYE_ARALIGI = 2

if not GOOGLE_API_KEY:
    print("UYARI: .env dosyasında GOOGLE_API_KEY bulunamadı!")  
    exit(1)

class AvalabsApp:
    def __init__(self, root):
        self.root = root
        self.root.title(f"AVALABS - Viral Video Asistanı (Her {SANIYE_ARALIGI}sn Bir Kare)")
        self.root.geometry("950x700")
        self.root.configure(bg="#f4f4f9")

        # --- ARAYÜZ (SOL PANEL) ---
        self.frame_left = tk.Frame(root, bg="white", padx=15, pady=15, relief="raised", bd=2)
        self.frame_left.place(relx=0.02, rely=0.02, relwidth=0.47, relheight=0.96)

        tk.Label(self.frame_left, text="1. VİDEO PLANLAMA", font=("Segoe UI", 14, "bold"), bg="white", fg="#333").pack(pady=(0, 10))
        
        tk.Label(self.frame_left, text="Video Konusu:", bg="white").pack(anchor="w")
        self.entry_title = tk.Entry(self.frame_left, font=("Segoe UI", 12), bd=2, relief="groove")
        self.entry_title.pack(pady=5, fill="x")

        self.btn_plan = tk.Button(self.frame_left, text="✨ Yapılacaklar Listesi Oluştur", command=self.generate_plan_thread, bg="#007bff", fg="white", font=("Segoe UI", 11, "bold"), cursor="hand2")
        self.btn_plan.pack(pady=10, fill="x")

        self.text_plan = scrolledtext.ScrolledText(self.frame_left, height=20, font=("Consolas", 10), bd=2)
        self.text_plan.pack(fill="both", expand=True)

        # --- ARAYÜZ (SAĞ PANEL) ---
        self.frame_right = tk.Frame(root, bg="#fff", padx=15, pady=15, relief="raised", bd=2)
        self.frame_right.place(relx=0.51, rely=0.02, relwidth=0.47, relheight=0.96)

        tk.Label(self.frame_right, text="2. VİDEO ANALİZİ", font=("Segoe UI", 14, "bold"), bg="white", fg="#333").pack(pady=(0, 10))

        self.btn_select = tk.Button(self.frame_right, text="📂 Video Dosyası Seç", command=self.select_video, bg="#ffc107", fg="#333", font=("Segoe UI", 10, "bold"), cursor="hand2")
        self.btn_select.pack(pady=5, fill="x")

        self.lbl_file = tk.Label(self.frame_right, text="Dosya seçilmedi", bg="white", fg="#666")
        self.lbl_file.pack(pady=5)

        self.btn_analyze = tk.Button(self.frame_right, text=f"🚀 Analiz Et)", command=self.analyze_video_thread, bg="#28a745", fg="white", font=("Segoe UI", 11, "bold"), state="disabled", cursor="hand2")
        self.btn_analyze.pack(pady=15, fill="x")

        self.text_result = scrolledtext.ScrolledText(self.frame_right, height=20, font=("Consolas", 10), bd=2)
        self.text_result.pack(fill="both", expand=True)
        
        self.selected_video_path = None

    # --- SİHİRLİ FONKSİYON ---
    def try_all_models(self, prompt, image_paths=[]):
        model_listesi = [
            "gemini-2.0-flash",       
            "gemini-2.5-flash",       
            "gemini-2.0-flash-lite",  
            "gemini-1.5-flash",
            "gemini-1.5-pro"         
        ]

        # Görsel verisini hazırla
        parts = [{"text": prompt}]
        for img_path in image_paths:
            try:
                with open(img_path, "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                    parts.append({
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": encoded_string
                        }
                    })
            except Exception as e:
                print(f"Resim hatası: {e}")

        payload = {"contents": [{"parts": parts}]}
        headers = {'Content-Type': 'application/json'}

        log_mesaji = ""

        for model_name in model_listesi:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GOOGLE_API_KEY}"
                response = requests.post(url, headers=headers, data=json.dumps(payload))
                
                if response.status_code == 200:
                    try:
                        cevap = response.json()['candidates'][0]['content']['parts'][0]['text']
                        return f"✅ BAŞARILI (Model: {model_name} | {len(image_paths)} Kare İncelendi)\n\n" + cevap
                    except:
                        continue
                else:
                    log_mesaji += f"❌ {model_name}: {response.status_code}\n"
            
            except Exception as e:
                log_mesaji += f"❌ {model_name} hatası: {e}\n"
        
        return f"HATA: Hiçbir model çalışmadı.\n{log_mesaji}"

    # --- PLANLAMA ---
    def generate_plan_thread(self):
        threading.Thread(target=self.generate_plan, daemon=True).start()

    def generate_plan(self):
        title = self.entry_title.get()
        if not title:
            messagebox.showwarning("Eksik", "Başlık girin.")
            return

        self.update_ui(self.btn_plan, "Bağlanılıyor...", "disabled")
        self.text_plan.delete(1.0, tk.END)
        self.text_plan.insert(tk.END, "⏳ Google Gemini'ye soruluyor...\n")

        prompt = f"Video Konusu: '{title}'. Viral video için 3 Hook, 3 B-roll, 1 Tartışma Sorusu yaz. Türkçe olsun."
        
        try:
            result_text = self.try_all_models(prompt)
            self.root.after(0, lambda: self.update_text(self.text_plan, result_text))
        except Exception as e:
            self.root.after(0, lambda: self.update_text(self.text_plan, str(e)))
        finally:
            self.root.after(0, lambda: self.update_ui(self.btn_plan, "✨ Yapılacaklar Listesi Oluştur", "normal"))

    # --- ANALİZ ---
    def select_video(self):
        path = filedialog.askopenfilename(filetypes=[("Video", "*.mp4 *.mov *.avi")])
        if path:
            self.selected_video_path = path
            self.lbl_file.config(text=f"Seçilen: {os.path.basename(path)}")
            self.btn_analyze.config(state="normal")

    def analyze_video_thread(self):
        threading.Thread(target=self.run_analysis, daemon=True).start()

    def run_analysis(self):
        self.update_ui(self.btn_analyze, "İşleniyor...", "disabled")
        self.text_result.delete(1.0, tk.END)
        
        # 1. KARELERİ AL (ARALIKLI)
        self.text_result.insert(tk.END, f"1/3 📸 Her {SANIYE_ARALIGI} saniyede bir kare alınıyor...\n")
        
        try:
            # Yeni fonksiyonu çağırıyoruz
            frames = self.extract_frames_interval(self.selected_video_path, interval_sec=SANIYE_ARALIGI)
            self.text_result.insert(tk.END, f"   -> Toplam {len(frames)} kare alındı.\n")
            
            # 2. SESİ İŞLE
            self.text_result.insert(tk.END, "2/3 🎤 Ses işleniyor (Whisper)...\n")
            transcript = self.transcribe_audio(self.selected_video_path)
            
            # 3. AI ANALİZİ
            self.text_result.insert(tk.END, "3/3 🤖 Yapay Zeka Analizi...\n")
            
            prompt = f"""
            Video Başlığı: {self.entry_title.get()}
            Transkript: {transcript}
            
            Ekli Görseller: Videonun her {SANIYE_ARALIGI} saniyesinden alınan karelerdir.
            
            Görevin bu videoyu analiz etmek.
            Çıktı Formatı:
            --- AVALABS RAPORU ---
            PUAN: [0-100]/100
            ✅ İYİ YÖNLER: (Maddeler)
            ⚠️ EKSİKLER: (Maddeler)
            💡 TAVSİYE: (Net bir öneri)
            """
            
            report = self.try_all_models(prompt, frames)
            
            self.root.after(0, lambda: self.update_text(self.text_result, report))
            
            # Temizlik
            for f in frames:
                if os.path.exists(f): os.remove(f)

        except Exception as e:
            self.root.after(0, lambda: self.update_text(self.text_result, f"HATA: {e}"))
        finally:
             self.root.after(0, lambda: self.update_ui(self.btn_analyze, f"🚀 Analiz Et ({SANIYE_ARALIGI}sn)", "normal"))

    # --- YARDIMCILAR ---
    def update_text(self, widget, text):
        widget.delete(1.0, tk.END)
        widget.insert(tk.END, text)
    
    def update_ui(self, widget, text, state):
        widget.config(text=text, state=state)

    # --- YENİ FONKSİYON: ARALIKLI KARE ALMA ---
    def extract_frames_interval(self, video_path, interval_sec=10):
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS) # Saniyedeki kare sayısı
        if fps == 0: return []
        
        # Her X saniyede bir kaç kare atlamalıyız?
        frame_step = int(fps * interval_sec)
        
        frames = []
        count = 0
        success = True
        
        while success:
            # frame_step kadar ileri sar
            cap.set(cv2.CAP_PROP_POS_FRAMES, count * frame_step)
            success, image = cap.read()
            
            if success:
                # Resmi kaydet
                path = f"temp_frame_{count}.jpg"
                
                # Resmi biraz küçültelim (Hız ve Kota Tasarrufu için)
                # Orijinal boyut yerine yarı yarıya küçültüyoruz
                height, width = image.shape[:2]
                new_dim = (width // 2, height // 2)
                resized_image = cv2.resize(image, new_dim, interpolation=cv2.INTER_AREA)
                
                cv2.imwrite(path, resized_image)
                frames.append(path)
                count += 1
                
                # Güvenlik önlemi: Maksimum 20 kare alalım (Çok uzun videolarda hata vermesin)
                if len(frames) >= 20:
                    break
        
        cap.release()
        return frames

    def transcribe_audio(self, video_path):
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = whisper.load_model("small", device=device)
        result = model.transcribe(video_path, fp16=False, language="tr")
        return result["text"]

if __name__ == "__main__":
    root = tk.Tk()
    app = AvalabsApp(root)
    root.mainloop()