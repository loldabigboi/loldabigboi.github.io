function parseData(trainingImageBytes, trainingLabelBytes, testingImageBytes, testingLabelBytes) {
    
    let trainingData = [],
        testingData  = [];

    let imageByteOffset = 16;
    let labelByteOffset = 8;
    for (let num = 0; num < 60000; num++) {

        let data = {
            inputs: [],
            label: null
        };

        let i;
        for (let y = 0; y < 28; y++) {
            for (let x = 0; x < 28; x++) {
                let noOffsetI = y*28 + x + 1;
                i = imageByteOffset + noOffsetI;
                let val = trainingImageBytes.bytes[i];
                data.inputs.push(val);
            }
        }

        data.label = trainingLabelBytes.bytes[labelByteOffset+num];
        imageByteOffset = i;
        trainingData.push(data);

    }
    imageByteOffset=16;

    for (let num = 0; num < 10000; num++) {

        let data = {
            inputs: [],
            label: null
        };

        let i;
        for (let y = 0; y < 28; y++) {
            for (let x = 0; x < 28; x++) {
                let noOffsetI = y*28 + x + 1;
                i = imageByteOffset + noOffsetI;
                let val = testingImageBytes.bytes[i];
                data.inputs.push(val);
            }
        }

        data.label = testingLabelBytes.bytes[labelByteOffset+num];
        imageByteOffset = i;
        testingData.push(data);

    }

    return {
        trainingData: trainingData,
        testingData: testingData
    }

}