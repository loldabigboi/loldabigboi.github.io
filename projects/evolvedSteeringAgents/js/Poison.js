class Poison extends Edible {

    render() {

        noStroke();
        fill(255, 0, 0);
        circle(this.pos.x ,this.pos.y, 5);

    }

}

Poison.DAMAGE_AMOUNT = 0.75;