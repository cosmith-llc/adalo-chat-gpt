import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const Bar = ({ delay, colorIndicator }: { delay: number, colorIndicator: string }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const animation = Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 2,
                duration: 300,
                delay,
                useNativeDriver: false,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }),
        ]);

        Animated.loop(animation).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.bar,
                {
                    transform: [{ scaleY: scaleAnim }],
                    backgroundColor: colorIndicator
                },
            ]}
        />
    );
};

const Loader = ({ colorIndicator = '424242' }) => {
    // Задаємо затримки: центральна паличка 0мс, бокові — більше
    const delays = [300, 150, 0, 150, 300];

    return (
        <View style={styles.container}>
            {delays.map((delay, index) => (
                <Bar key={index} delay={delay} colorIndicator={colorIndicator} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: 30,
        marginTop: 5,
        marginBottom: 5,

    },
    bar: {
        width: 6,
        height: 15,
        backgroundColor: "#424242",
        marginHorizontal: 3,
        borderRadius: 3,
    },
});

export default Loader;
