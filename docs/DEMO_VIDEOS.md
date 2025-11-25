# Demo videos

This document contains guidance and links for including playable demo videos in the repository README and a retained short MP4 excerpt used for quick reviews.

Registration demo (excerpt)

[View demo on GitHub Attachments](https://github.com/user-attachments/assets/74fa75dc-35d6-42e8-b6b4-87cb92cc3991)

[Download MP4](../demo-videos/registration-excerpt.mp4)

Guidance

- Encode clips to MP4 using H.264 + AAC (example):

```bash
ffmpeg -y -i input.mov -c:v libx264 -preset slow -crf 20 -c:a aac -b:a 128k -movflags +faststart output.mp4
```

- Create a thumbnail for the player poster:

```bash
ffmpeg -y -i output.mp4 -ss 00:00:01 -vframes 1 -vf "scale=1280:-2" demo-videos/thumbnail.png
```

