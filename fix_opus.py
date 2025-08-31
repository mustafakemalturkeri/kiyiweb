#!/usr/bin/env python3
import os
import subprocess
import json

def fix_broken_opus_files():
    """Fix opus files that have infinite duration in browser"""
    
    # List of broken tracks (those showing Infinity duration)
    broken_tracks = [1, 4, 5, 6, 7, 8, 9, 10, 11]
    
    # Working tracks: 2, 3
    working_tracks = [2, 3]
    
    compressed_dir = "assets/audio/compressed"
    
    # Find original M4A files
    original_files = {}
    for root, dirs, files in os.walk("assets/audio"):
        for file in files:
            if file.lower().endswith('.m4a'):
                # Extract track number from filename
                if file.startswith('01'):
                    original_files[1] = os.path.join(root, file)
                elif file.startswith('02'):
                    original_files[2] = os.path.join(root, file)
                elif file.startswith('03'):
                    original_files[3] = os.path.join(root, file)
                elif file.startswith('04'):
                    original_files[4] = os.path.join(root, file)
                elif file.startswith('05'):
                    original_files[5] = os.path.join(root, file)
                elif file.startswith('06'):
                    original_files[6] = os.path.join(root, file)
                elif file.startswith('07'):
                    original_files[7] = os.path.join(root, file)
                elif file.startswith('08'):
                    original_files[8] = os.path.join(root, file)
                elif file.startswith('09'):
                    original_files[9] = os.path.join(root, file)
                elif file.startswith('10'):
                    original_files[10] = os.path.join(root, file)
                elif file.startswith('11'):
                    original_files[11] = os.path.join(root, file)
    
    print(f"Found {len(original_files)} original M4A files")
    print(f"Need to fix {len(broken_tracks)} broken opus files")
    
    for track_num in broken_tracks:
        if track_num in original_files:
            m4a_file = original_files[track_num]
            base_name = os.path.splitext(os.path.basename(m4a_file))[0]
            output_file = os.path.join(compressed_dir, f"{base_name}.opus")
            
            print(f"\nFixing track {track_num}: {base_name}")
            
            # Use different encoding parameters for better browser compatibility
            command = [
                'ffmpeg', '-i', m4a_file,
                '-c:a', 'libopus',
                '-b:a', '48k',  # Lower bitrate for better compatibility
                '-vbr', 'off',  # Constant bitrate for better compatibility
                '-application', 'audio',  # Audio application mode
                '-frame_duration', '20',  # 20ms frame duration
                '-y',  # Overwrite output file
                output_file
            ]
            
            print(f"Command: {' '.join(command)}")
            
            result = subprocess.run(command, capture_output=True, text=True)
            
            if result.returncode == 0:
                # Check the new file
                file_size = os.path.getsize(output_file)
                print(f"✓ Fixed: {base_name} ({file_size / (1024*1024):.1f}MB)")
                
                # Verify duration with ffprobe
                probe_command = ['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration', '-of', 'csv=p=0', output_file]
                probe_result = subprocess.run(probe_command, capture_output=True, text=True)
                if probe_result.returncode == 0:
                    duration = float(probe_result.stdout.strip())
                    print(f"  Duration: {duration:.2f}s")
                else:
                    print(f"  Could not verify duration")
            else:
                print(f"✗ Failed to fix {base_name}")
                print(f"Error: {result.stderr}")

if __name__ == "__main__":
    fix_broken_opus_files()
