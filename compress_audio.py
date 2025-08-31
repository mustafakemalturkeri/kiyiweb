#!/usr/bin/env python3
"""
Audio Compression Script for Web Deployment
Converts M4A files to Opus format with optimized settings for web streaming
"""

import os
import subprocess
import json
from pathlib import Path

def check_ffmpeg():
    """Check if ffmpeg is installed"""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def get_file_size_mb(file_path):
    """Get file size in MB"""
    return os.path.getsize(file_path) / (1024 * 1024)

def compress_audio_to_opus(input_file, output_file, bitrate='128k'):
    """Convert audio file to Opus format with specified bitrate"""
    
    cmd = [
        'ffmpeg',
        '-i', str(input_file),
        '-c:a', 'libopus',           # Opus codec
        '-b:a', bitrate,             # Audio bitrate
        '-vbr', 'on',                # Variable bitrate
        '-compression_level', '10',   # Max compression
        '-frame_duration', '20',      # 20ms frames (good for speech/music)
        '-application', 'audio',      # Optimize for music
        '-y',                        # Overwrite output file
        str(output_file)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return True, ""
    except subprocess.CalledProcessError as e:
        return False, f"FFmpeg error: {e.stderr}"

def process_audio_files():
    """Process all M4A files in assets/audio directory"""
    
    # Check if ffmpeg is available
    if not check_ffmpeg():
        print("❌ FFmpeg not found!")
        print("Install with: brew install ffmpeg (macOS) or apt install ffmpeg (Linux)")
        return
    
    audio_dir = Path('assets/audio')
    compressed_dir = audio_dir / 'compressed'
    compressed_dir.mkdir(exist_ok=True)
    
    # Find all M4A files
    m4a_files = list(audio_dir.glob('*.m4a')) + list(audio_dir.glob('*.M4A'))
    
    if not m4a_files:
        print("❌ No M4A files found in assets/audio/")
        return
    
    print(f"🎵 Found {len(m4a_files)} M4A files")
    print("🔄 Starting compression...")
    
    results = []
    total_original_size = 0
    total_compressed_size = 0
    
    for m4a_file in m4a_files:
        # Generate output filename
        opus_filename = m4a_file.stem + '.opus'
        opus_file = compressed_dir / opus_filename
        
        print(f"\n📁 Processing: {m4a_file.name}")
        
        original_size = get_file_size_mb(m4a_file)
        total_original_size += original_size
        
        print(f"   Original size: {original_size:.2f} MB")
        
        # Try different bitrates for optimal quality/size ratio
        bitrates = ['48k', '96k']
        best_file = None
        best_size = float('inf')
        
        for bitrate in bitrates:
            temp_file = compressed_dir / f"{m4a_file.stem}_{bitrate}.opus"
            
            success, error = compress_audio_to_opus(m4a_file, temp_file, bitrate)
            
            if success:
                size = get_file_size_mb(temp_file)
                print(f"   {bitrate}: {size:.2f} MB")
                
                if size < best_size:
                    if best_file and best_file.exists():
                        best_file.unlink()  # Delete previous best
                    best_file = temp_file
                    best_size = size
                else:
                    temp_file.unlink()  # Delete this version
            else:
                print(f"   ❌ Failed at {bitrate}: {error}")
        
        if best_file:
            # Rename best file to final name
            final_file = compressed_dir / opus_filename
            if final_file.exists():
                final_file.unlink()
            best_file.rename(final_file)
            
            compressed_size = get_file_size_mb(final_file)
            total_compressed_size += compressed_size
            compression_ratio = (1 - compressed_size / original_size) * 100
            
            results.append({
                'original': m4a_file.name,
                'compressed': opus_filename,
                'original_size_mb': round(original_size, 2),
                'compressed_size_mb': round(compressed_size, 2),
                'compression_ratio': round(compression_ratio, 1)
            })
            
            print(f"   ✅ Compressed: {compressed_size:.2f} MB ({compression_ratio:.1f}% reduction)")
        else:
            print(f"   ❌ Failed to compress {m4a_file.name}")
    
    # Update links.json to use compressed files
    update_links_json(results)
    
    # Print summary
    print(f"\n📊 COMPRESSION SUMMARY")
    print(f"{'='*50}")
    print(f"Total original size: {total_original_size:.2f} MB")
    print(f"Total compressed size: {total_compressed_size:.2f} MB")
    total_reduction = (1 - total_compressed_size / total_original_size) * 100
    print(f"Total size reduction: {total_reduction:.1f}%")
    print(f"\n✅ Compressed files saved to: {compressed_dir}")

def update_links_json(results):
    """Update links.json to use compressed Opus files"""
    
    links_file = Path('links.json')
    
    if not links_file.exists():
        print("❌ links.json not found")
        return
    
    try:
        with open(links_file, 'r', encoding='utf-8') as f:
            links_data = json.load(f)
        
        # Update paths to compressed files
        for i, result in enumerate(results, 1):
            if str(i) in links_data.get('tracks', {}):
                new_path = f"assets/audio/compressed/{result['compressed']}"
                links_data['tracks'][str(i)] = new_path
        
        # Create backup
        backup_file = Path('links.json.backup')
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(links_data, f, indent=2, ensure_ascii=False)
        
        # Update original
        with open(links_file, 'w', encoding='utf-8') as f:
            json.dump(links_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Updated links.json (backup saved as links.json.backup)")
        
    except Exception as e:
        print(f"❌ Error updating links.json: {e}")

def main():
    """Main function"""
    print("🎵 Audio Compression Tool for Web Deployment")
    print("=" * 50)
    
    if not Path('assets/audio').exists():
        print("❌ assets/audio directory not found!")
        return
    
    process_audio_files()
    
    print(f"\n🌐 Web Optimization Tips:")
    print(f"- Opus format has excellent browser support")
    print(f"- Smaller files = faster loading + better seeking")
    print(f"- Consider adding preload='metadata' to audio elements")

if __name__ == "__main__":
    main()
