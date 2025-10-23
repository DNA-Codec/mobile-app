<script setup lang="ts">
import {
    IonButton,
    IonCard,
    IonCardContent, IonCardHeader,
    IonCardSubtitle,
    IonContent,
    IonInput, IonInputPasswordToggle,
    IonPage
} from '@ionic/vue';
import { ref } from 'vue';
import { useCommsSingleton } from './composables/comms';
import { useLogin } from './composables/login';

const isRegistering = ref(false);

const { usernameError, passwordError } = useCommsSingleton();
const { username, password, verifyPassword, handleSubmit } = useLogin();

</script>

<template>
    <ion-page>
        <ion-content :fullscreen="true">
            <div id="login-card-container">
                <ion-card id="login-card">
                    <img alt="Noodles" src="/noodles_banner.png" />

                    <ion-card-header>
                        <ion-card-subtitle>{{ isRegistering ? 'Register' : 'Login' }} to access
                            Noodles</ion-card-subtitle>
                    </ion-card-header>

                    <ion-card-content>
                        <div id="login">
                            <ion-input label="Username" label-placement="floating" fill="outline"
                                placeholder="Enter Username" :value="username"
                                @ion-input="(i) => username = `${i.target.value}`"></ion-input>

                            <p class="error-text" v-if="usernameError">{{ usernameError }}</p>

                            <br v-if="isRegistering" />

                            <ion-input type="password" label="Password" label-placement="floating" fill="outline"
                                placeholder="Enter Password" :value="password"
                                @ion-input="(i) => password = `${i.target.value}`">
                                <ion-input-password-toggle v-if="password.length > 0"
                                    slot="end"></ion-input-password-toggle>
                            </ion-input>

                            <ion-input v-if="isRegistering" type="password" label="Verify Password"
                                label-placement="floating" fill="outline" placeholder="Enter Password Again"
                                :value="verifyPassword" @ion-input="(i) => verifyPassword = `${i.target.value}`">
                            </ion-input>

                            <p class="error-text" v-if="passwordError">{{ passwordError }}</p>

                            <ion-button @click="handleSubmit({ isRegistering })" expand="block">{{ isRegistering ?
                                'Register' : 'Login'
                                }}</ion-button>

                            <p v-if="isRegistering">Already have an account? <a @click="isRegistering = false">Login</a>
                            </p>
                            <p v-else>Don't have an account? <a @click="isRegistering = true">Register</a></p>
                        </div>
                    </ion-card-content>
                </ion-card>
            </div>
        </ion-content>
    </ion-page>
</template>

<style scoped>
#login-card-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
}

#login-card {
    width: 100%;
    max-width: 400px;
    margin: 20px;
    padding: 10px;
    padding-top: 20px;
    padding-bottom: 20px;
}

#login {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
}

.error-text {
    color: red;
    font-size: 12px;
}
</style>
