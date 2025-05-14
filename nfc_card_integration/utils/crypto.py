from cryptography.fernet import Fernet

# Generate a new key ONCE and copy it here as bytes!
FERNET_KEY = b'put_your_fernet_key_here=='  # Replace with your actual key!

def encrypt_card_id(card_id):
    f = Fernet(FERNET_KEY)
    return f.encrypt(card_id.encode()).decode()

def decrypt_card_id(token):
    f = Fernet(FERNET_KEY)
    return f.decrypt(token.encode()).decode()