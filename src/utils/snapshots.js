import { onSnapshot } from 'mobx-state-tree';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";

import Tokens from './../stores/Tokens';
import Auth from './../stores/Auth';
import Settings from './../stores/Settings';
import Share from '../stores/Share'

function debounce(func, wait) {
	let timeout
	return function (...args) {
		const context = this
		clearTimeout(timeout)
		timeout = setTimeout(() => func.apply(context, args), wait)
	}
}

const debounce_ms = 1500

onSnapshot(Tokens, snapshot => { SecureStore.setItem('Tokens', JSON.stringify(snapshot), {}), console.log("SNAPSHOT:::TOKENS") });
onSnapshot(Auth, debounce(
	snapshot => {
		AsyncStorage.setItem('Auth', JSON.stringify(snapshot));
		console.log("SNAPSHOT:::AUTH")
	}, debounce_ms ))
onSnapshot(Settings, snapshot => { AsyncStorage.setItem('Settings', JSON.stringify(snapshot)), console.log("SNAPSHOT:::SETTINGS") })
onSnapshot(Share, snapshot => { AsyncStorage.setItem('Share', JSON.stringify(snapshot)), console.log("SNAPSHOT:::SHARE") });
