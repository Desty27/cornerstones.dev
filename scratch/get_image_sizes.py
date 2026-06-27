import struct
import os

def get_image_size(fname):
    with open(fname, 'rb') as fhandle:
        head = fhandle.read(24)
        if len(head) != 24:
            return None
        if head[0:4] == b'\x89PNG':
            # PNG
            w, h = struct.unpack('>ii', head[16:24])
            return w, h
        elif head[0:2] == b'\xff\xd8':
            # JPEG
            fhandle.seek(0)
            size = 2
            ftype = 0
            while size:
                try:
                    fhandle.seek(size, 1)
                    byte = fhandle.read(2)
                    if not byte:
                        break
                    while byte and byte[0] == 0xff:
                        byte = fhandle.read(1)
                        if not byte:
                            break
                    if not byte:
                        break
                    ftype = byte[0]
                    size_data = fhandle.read(2)
                    if len(size_data) < 2:
                        break
                    size = struct.unpack('>H', size_data)[0] - 2
                    if ftype == 0xc0 or ftype == 0xc2:
                        fhandle.seek(1, 1)
                        h, w = struct.unpack('>HH', fhandle.read(4))
                        return w, h
                except Exception:
                    break
    return None

for filename in os.listdir('assets'):
    if filename.endswith('.jpg') or filename.endswith('.png'):
        path = os.path.join('assets', filename)
        print(filename, get_image_size(path))
