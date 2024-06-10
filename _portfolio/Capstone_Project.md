---
title: "Computational Fluid Dynamics Using Smart Proxy Models"
excerpt: "Implementation of Smart Proxy Models in predicting the fluid velocity field of an indoor enviornment<br/><img src='/images/Inlet.png'>"
collection: portfolio
---
The following PDF is my Dissertation project that I completed in my final year at Durham University. I collected fluid simulation data for a small indoor office space using Ansys Fluent, this process is not possible on most computers due to the large RAM requirements of the simulation. Each simulation takes five hours to run on Durham Universities supercomputer which generated the training data for a Smart Proxy Model which leveraged Deep Learning. The final model was able to replicate simulation data to a Mean Absolute Percentage error of around 2%.
## Embedded PDF

<div class="pdf-container">
    <iframe src="/files/Capstone_Project.pdf"></iframe>
</div>

## Link to PDF

[View PDF](files/MS_diagnosis.pdf)

<style>
.pdf-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 141.67%; /* 900 / 1100 = 0.8181, so 141.67% for height to width ratio */
}

.pdf-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
}

@media (max-width: 768px) {
    .pdf-container {
        padding-bottom: 200%; /* Adjust the aspect ratio for mobile view */
    }
}
</style>
