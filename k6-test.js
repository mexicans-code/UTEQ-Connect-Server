import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '20s', target: 5 },
        { duration: '20s', target: 5 },
        { duration: '10s', target: 0 },
    ],
};

const BASE_URL = 'http://localhost:3000';

export default function () {

    const resHome = http.get(`${BASE_URL}/`);
    check(resHome, {
        'home status 200': (r) => r.status === 200,
    });

    sleep(1);

    const resPersonal = http.get(`${BASE_URL}/api/personal`);
    check(resPersonal, {
        'personal status 200': (r) => r.status === 200,
    });

    sleep(1);
}