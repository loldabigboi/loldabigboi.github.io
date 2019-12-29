class Food extends Edible{

    render() {

        noStroke();
        fill(0, 255, 0);
        circle(this.pos.x ,this.pos.y, 5);

    }

}

Food.HEAL_AMOUNT = 0.2;