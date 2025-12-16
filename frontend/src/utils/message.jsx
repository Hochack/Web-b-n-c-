// src/utils/message.js
import './message.css';

// Hiển thị thông báo tự động ẩn (ở khu vực .messages)
export function messages(text, duration = 3000) {
    const msgBox = document.createElement('div');
    msgBox.className = 'message';
    msgBox.textContent = text;

    const container = document.querySelector('.messages');
    if (!container) {
        console.warn('Không tìm thấy .messages để hiển thị message');
        return;
    }

    container.appendChild(msgBox);
    msgBox.style.display = 'block';

    setTimeout(() => {
        msgBox.style.opacity = '0';
        setTimeout(() => msgBox.remove(), 5000);
    }, duration);
}

// Hiển thị hộp xác nhận, trả về Promise
export function confirmBox(text) {
    return new Promise((resolve) => {
        const box = document.createElement('div');
        box.className = 'confirm-box';

        box.innerHTML = `
            <p>${text}</p>
            <div>
                <button class="yes">OK</button>
                <button class="no">Hủy</button>
            </div>
        `;

        document.body.appendChild(box);

        box.querySelector('.yes').addEventListener('click', () => {
            resolve(true);
            box.remove();
        });

        box.querySelector('.no').addEventListener('click', () => {
            resolve(false);
            box.remove();
        });
    });
}

// Hiển thị thông báo gần input, dạng "spot message"
export function showSpotMessage({ id }, isValid, text = null) {
    const element = document.querySelector(`.container-input.input-${id}`);

    // Xóa thông báo cũ nếu có
    const oldMessage = element?.querySelector('.spot-message');
    if (oldMessage) oldMessage.remove();

    // Nội dung mặc định nếu không truyền vào
    if (!text) {
        if (id === 'user' && !isValid) {
            text = 'Example: example@domain.com or 0123456789.';
        } else if (id === 'username' && !isValid) {
            text = 'At least 1 lowercase letter and 1 uppercase letter, minimum: 5 characters.';
        } else if (id === 'email' && !isValid) {
            text = 'Example: example@domain.com.';
        } else if (id === 'phone' && !isValid) {
            text = 'Phone number from 8 to 16 digits.';
        } else if (id === 'birthday' && !isValid) {
            text = '"dd/mm/yyyy".';
        } else if (id === 'gender' && !isValid) {
            text = '"Male or female".';
        } else if (id === 'password' && !isValid) {
            text = 'At least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character, minimum: 8 characters.';
        } else if (id === 'passwords' && !isValid) {
            text = 'At least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character, minimum: 8 characters.';
        } else if (id === 'repassword' && !isValid) {
            text = 'Password does not match.';
        } else if (id === 'captcha' && !isValid) {
            text = 'Captcha does not match.';
        }
    }

    if (text) {
        const message = document.createElement('div');
        message.className = 'spot-message';
        message.innerHTML = '<i class="fa fa-info-circle"></i> ' + text;
        element?.appendChild(message);

        // Ẩn sau 3s
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}


// Cách dùng
// Hiển thị thông báo Thay vì alert("Registration successful!") thì gọi:
// import { messages } from './message.js';
// messages("Registration successful!");

// Hiển thị lỗi hoặc thông báo gần input:
// import { showSpotMessage } from './message.js';
// showSpotMessage({ id: 'email' }, false);  // hiển thị lỗi chuẩn email

// Hiển thị hộp confirm:
// import { confirmBox } from './message.js';
// const ok = await confirmBox("Are you sure?");
// if (ok) {
//   // làm gì đó
// }