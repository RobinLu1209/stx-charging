import socket

s3 = socket.socket(socket.AF_INET,socket.SOCK_STREAM)

s3.bind(('192.168.100.100',9978))
s3.listen(5)

while True:
    connection,addr = s3.accept()
    try:
        connection.settimeout(50)
        while True:
            buf = connection.recv(1024)
            if(buf != ''):
                print('recieved:', buf)
    except s3.timeout:
        print('time out')
    connection.close()
