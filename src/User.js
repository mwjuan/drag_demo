import _ from "lodash";
import { Component } from "react";

let users = [];
let seats = [];

for (let index = 1; index < 10; index++) {
    let user = {
        id: index,
        name: `user${index}`
    }

    users.push(user);

    let seat = {
        id: index,
        user: index
    }

    seats.push(seat);
}

class User extends Component {
    state = {
        user: null,
        seat: null,
        users,
        seats
    }

    onDragStart = (e) => {
        let id = parseInt(e.target.id);

        let user = _.find(this.state.users, p => p.id === id);
        this.setState({
            user
        })
    }

    handleDragEnter = (e) => {
        e.preventDefault();
    }

    handleDragLeave = (e) => {
        e.preventDefault();
    }

    handleDrop = (e) => {
        e.preventDefault();
        let seatId = parseInt(_.last(e.target.id.split('_')));
        let oldseat = null, temp = { id: null, user: null }, oldindex = null;
        if (this.state.user) {
            oldseat = _.find(this.state.seats, s => s.user === this.state.user.id);
            oldindex = _.findIndex(this.state.seats, s => s.user === this.state.user.id);
            let seat = _.find(this.state.seats, p => p.id === seatId);
            temp.id = oldseat.id;
            temp.user = seat.user;
        }

        let newseat = { id: seatId, user: this.state.user ? this.state.user.id : '' };

        let seats = this.state.seats;
        let index = _.findIndex(seats, p => p.id === seatId);


        _.fill(seats, newseat, index, index + 1);
        if (temp) {
            _.fill(seats, temp, oldindex, oldindex + 1)
        }

        this.setState({ seats });
    }

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', margin: 20, width: '40%' }}>
                <div>
                    {
                        _.map(this.state.seats, seat => {
                            let user = _.find(this.state.users, p => p.id === seat.user);

                            return <div key={`div_${seat.id}`} id={`div_${seat.id}`}
                                onDragEnter={this.handleDragEnter}
                                onDragLeave={this.handleDragLeave}
                                onDragOver={this.handleDragEnter}
                                onDrop={this.handleDrop}
                                style={{ width: 100, height: 30, margin: 5, border: '1px solid #aaa' }}>
                                <span>{user ? user.name : ''}</span>
                            </div>
                        })
                    }
                </div>
                <ol id='ol'>
                    {
                        _.map(this.state.users, u => {
                            return <li key={u.id} id={u.id} draggable={true} onDragStart={this.onDragStart}>{u.name}</li>
                        })
                    }
                </ol>
            </div>
        );
    }
}

export default User;