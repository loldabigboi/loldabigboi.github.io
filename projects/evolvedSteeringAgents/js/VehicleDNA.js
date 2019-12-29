class VehicleDNA {

    constructor(parentDna) {

        if (!parentDna) {

            this.foodDetectionRadius    = Math.random() * VehicleDNA.MAX_DETECTION_RADIUS;
            this.poisonDetectionRadius  = Math.random() * VehicleDNA.MAX_DETECTION_RADIUS;
            this.vehicleDetectionRadius = Math.random() * VehicleDNA.MAX_DETECTION_RADIUS;

            this.foodAttraction    = VehicleDNA.MIN_ATTRACTION + 
                                     Math.random() * (VehicleDNA.MAX_ATTRACTION - VehicleDNA.MIN_ATTRACTION);
            this.poisonAttraction  = VehicleDNA.MIN_ATTRACTION + 
                                     Math.random() * (VehicleDNA.MAX_ATTRACTION - VehicleDNA.MIN_ATTRACTION);
            this.vehicleAttraction = VehicleDNA.MIN_ATTRACTION + 
                                     Math.random() * (VehicleDNA.MAX_ATTRACTION - VehicleDNA.MIN_ATTRACTION);

        } else {

            this.foodDetectionRadius = parentDna.foodDetectionRadius;
            if (Math.random() < VehicleDNA.MUTATION_RATE) {
                this.mutateDetectionRadius("foodDetectionRadius");
            }

            this.poisonDetectionRadius = parentDna.poisonDetectionRadius;
            if (Math.random() < VehicleDNA.MUTATION_RATE) {
                this.mutateDetectionRadius("poisonDetectionRadius");
            }

            this.vehicleDetectionRadius = parentDna.vehicleDetectionRadius;
            if (Math.random() < VehicleDNA.MUTATION_RATE) {
                this.mutateDetectionRadius("vehicleDetectionRadius");
            }

            this.foodAttraction = parentDna.foodAttraction;
            if (Math.random() < VehicleDNA.MUTATION_RATE) {
                this.mutateAttraction("foodAttraction");
            }

            this.poisonAttraction = parentDna.poisonAttraction;
            if (Math.random() < VehicleDNA.MUTATION_RATE) {
                this.mutateAttraction("poisonAttraction");
            }

            this.vehicleAttraction = parentDna.vehicleAttraction;
            if (Math.random() < VehicleDNA.MUTATION_RATE) {
                this.mutateAttraction("vehicleAttraction");
            }

            this.constrainGenes();


        }

    }

    // gene specifies whether it's the food or poison detection radius
    mutateDetectionRadius(gene) {

        let bound = VehicleDNA.MAX_DETECTION_RADIUS * VehicleDNA.MUTATION_SEVERITY;
        this[gene] += -bound + Math.random() * (2*bound);

    }

    mutateAttraction(gene) {

        let bound = (VehicleDNA.MAX_ATTRACTION - VehicleDNA.MIN_ATTRACTION) * VehicleDNA.MUTATION_SEVERITY;
        this[gene] += -bound + Math.random() * (2*bound);

    }

    // keep genes within defined bounds
    constrainGenes() {

        this.foodDetectionRadius    = Math.min(Math.max(0, this.foodDetectionRadius  ), VehicleDNA.MAX_DETECTION_RADIUS);
        this.poisonDetectionRadius  = Math.min(Math.max(0, this.poisonDetectionRadius), VehicleDNA.MAX_DETECTION_RADIUS);
        this.vehicleDetectionRadius = Math.min(Math.max(0, this.vehicleDetectionRadius), VehicleDNA.MAX_DETECTION_RADIUS);

        this.foodAttraction    = Math.min(Math.max(VehicleDNA.MIN_ATTRACTION, this.foodAttraction  ), VehicleDNA.MAX_ATTRACTION);
        this.poisonAttraction  = Math.min(Math.max(VehicleDNA.MIN_ATTRACTION, this.poisonAttraction), VehicleDNA.MAX_ATTRACTION);
        this.vehicleAttraction = Math.min(Math.max(VehicleDNA.MIN_ATTRACTION, this.vehicleAttraction), VehicleDNA.MAX_ATTRACTION);


    }

}

VehicleDNA.MUTATION_RATE = 0.05;
VehicleDNA.MUTATION_SEVERITY = 0.33;
VehicleDNA.MAX_DETECTION_RADIUS = 200;
VehicleDNA.MAX_ATTRACTION = 0.5;
VehicleDNA.MIN_ATTRACTION = -0.5;