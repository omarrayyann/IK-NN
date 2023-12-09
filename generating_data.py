from robot import Manipulator, Link
from math import pi
import random

link1 = Link(theta_offset=0, d=0, alpha=0, a=5)
link2 = Link(theta_offset=0, d=0, alpha=0, a=5)

robot = Manipulator()
robot.add_link(link1)
robot.add_link(link2)

joint_angle_1_from = -2*pi
joint_angle_1_to = 2*pi
joint_angle_1_step = 0.1
joint_angle_2_from = -2*pi
joint_angle_2_to = 2*pi
joint_angle_2_step = 0.1

quadrant_1_only = True

with open('fk_data.txt', 'w') as file:
    joint_angle_1 = joint_angle_1_from
    while joint_angle_1 <= joint_angle_1_to:
        print((joint_angle_1-(joint_angle_1_from))/(joint_angle_1_to-joint_angle_1_from))
        joint_angle_2 = joint_angle_1_from
        while joint_angle_2 <= joint_angle_2_to:
            end_effector_positions = robot.forward_kinematics([joint_angle_1,joint_angle_2])
            x = end_effector_positions[0][3]
            y = end_effector_positions[1][3]
            if(quadrant_1_only and (x<0 or y<0)):
                joint_angle_2 = joint_angle_2 + joint_angle_2_step
                continue
            for i in range(40):
                ran = random.uniform(-0.1, 0.1)  
                nearby_joint_angle_1 = joint_angle_1 + ran
                ran = random.uniform(-0.1, 0.1)  
                nearby_joint_angle_2 = joint_angle_2 + ran
                file.write(str(joint_angle_1))
                file.write(" ")
                file.write(str(joint_angle_2))
                file.write(" ")
                file.write(str(nearby_joint_angle_1))
                file.write(" ")
                file.write(str(nearby_joint_angle_2))
                file.write(" ")
                file.write(str(x))
                file.write(" ")
                file.write(str(y))
                file.write("\n")
            joint_angle_2 = joint_angle_2 + joint_angle_2_step
        joint_angle_1 = joint_angle_1 + joint_angle_1_step


print(x,y)