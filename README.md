# ui5lab-workorder-sample
Work order application sample for ui5lab

![UI5Lab Logo](https://raw.githubusercontent.com/UI5Lab/UI5Lab-central/master/docs/media/UI5LabLogoPhoenix.png)

# What is it

UI5Lab is a community driven repository for UI5 Custom Control Libraries. It's purpose is to make it easy for everyone to share, retrieve and use UI5 Custom Controls. Explore them in the [UI5Lab browser](https://ui5lab.io/browser). Contributions welcome!

# UI5Lab-central
This repository contains a sample application to demonstrate how promise chaining can help in code reusability of functional areas and also provides more maintainable and flexible code.    

### Setup

Run the following commands to test or develop this project:

1. Clone this repository to your local developer workspace
```bash
git clone https://github.com/shailenk/ui5lab-workorder-sample.git
cd ui5lab-workorder-sample
```

2. Load npm dependencies without running their individual scripts
```bash
npm install --ignore-scripts
```

3. Copy all files to the correct places and adjust bootstrap to CDN
```bash
npm run postinstall
```

> *Note:* to test the deployment that is triggered via Travis call `npm run deploy`. All resources for deployment will be put in a subfolder `deploy`.
 

4. Run a local server for testing 
```bash
npm start
```

4. Go to [http://localhost:8080/test/com/samples/SampleWorkOrder.html](http://localhost:8080/test/com/samples/SampleWorkOrder.html) to display all available UI5Lab libraries
