from robot import Manipulator, Link
from math import pi

link1 = Link(theta=0, d=0, alpha=0, a=1)
link2 = Link(theta=0, d=0, alpha=0, a=1)

robot = Manipulator()
robot.add_link(link1)
robot.add_link(link2)

joint_angle_1_from = -pi/2
joint_angle_1_to = pi/2
joint_angle_1_step = 0.01
joint_angle_2_from = -pi
joint_angle_2_to = pi
joint_angle_2_step = 0.01

with open('fk_data.txt', 'w') as file:
    joint_angle_1 = joint_angle_1_from
    while joint_angle_1 <= joint_angle_1_to:
        print((joint_angle_1-(joint_angle_1_from))/(joint_angle_1_to-joint_angle_1_from))
        joint_angle_2 = joint_angle_1_from
        while joint_angle_2 <= joint_angle_2_to:
            end_effector_positions = robot.forward_kinematics([joint_angle_1,joint_angle_2])
            x = end_effector_positions[0][3]
            y = end_effector_positions[1][3]
            file.write(str(joint_angle_1))
            file.write(" ")
            file.write(str(joint_angle_2))
            file.write(" ")
            file.write(str(x))
            file.write(" ")
            file.write(str(y))
            file.write("\n")
            joint_angle_2 = joint_angle_2 + joint_angle_2_step
        joint_angle_1 = joint_angle_1 + joint_angle_1_step


print(x,y)