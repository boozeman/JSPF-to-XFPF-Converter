function convert() {
    const fileInput = document.getElementById("jspfFile");
    if (!fileInput.files.length) {
        alert("Please select a JSPF file!");
        return;
    }

    const formData = new FormData();
    formData.append("jspf", fileInput.files[0]);

    fetch("/convert", { method: "POST", body: formData })
        .then(res => res.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "playlist.xspf";
            document.body.appendChild(a);
            a.click();
            a.remove();
        })
        .catch(err => alert("Error: " + err));
}
